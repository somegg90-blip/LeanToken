import pandas as pd
import tiktoken
from groq import Groq
from app.core.config import settings
from supabase import create_client, Client

# Initialize Clients
client = Groq(api_key=settings.GROQ_API_KEY)
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Pricing (shortened for brevity)
PRICING = {
    "gpt-4": {"input": 30.00, "output": 60.00},
    "gpt-4-turbo": {"input": 10.00, "output": 30.00},
    "gpt-4o": {"input": 2.50, "output": 10.00},
    "gpt-3.5-turbo": {"input": 0.50, "output": 1.50},
    "claude-3-opus": {"input": 15.00, "output": 75.00},
    "claude-3-sonnet": {"input": 3.00, "output": 15.00},
    "claude-3-haiku": {"input": 0.25, "output": 1.25},
}

def count_tokens(text: str, model: str) -> int:
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))

def calculate_cost(tokens: int, model: str, type: str) -> float:
    if model not in PRICING:
        model = "gpt-3.5-turbo"
    rate = PRICING[model][type]
    return (tokens / 1_000_000) * rate

def analyze_data(df: pd.DataFrame, user_id: str):
    total_cost = 0
    potential_savings = 0
    analysis_results = []

    # Check Usage Limit
    # We check how many rows this user has in the 'analyses' table
    response = supabase.table('analyses').select('id', count='exact').eq('user_id', user_id).execute()
    count = response.count
    
    # LIMIT LOGIC: If they have 1 or more, they hit the free limit.
    # In future, we can check a 'is_premium' boolean here.
    if count >= 1:
        return {
            "error": "limit_reached",
            "message": "You have used your 1 free analysis. Please upgrade to continue."
        }

    # Process the file
    df.columns = df.columns.str.strip().str.lower()
    
    for index, row in df.iterrows():
        prompt = str(row.get('prompt', ''))
        completion = str(row.get('completion', ''))
        model = str(row.get('model', 'gpt-3.5-turbo'))
        
        if model == "gpt4": model = "gpt-4"

        input_tokens = count_tokens(prompt, model)
        output_tokens = count_tokens(completion, model)
        
        current_model_pricing = model if model in PRICING else "gpt-3.5-turbo"
        input_cost = calculate_cost(input_tokens, current_model_pricing, 'input')
        output_cost = calculate_cost(output_tokens, current_model_pricing, 'output')
        row_cost = input_cost + output_cost
        total_cost += row_cost

        if "gpt-4" in model and input_tokens < 500:
            cheaper_model = "gpt-3.5-turbo"
            cheaper_cost = calculate_cost(input_tokens, cheaper_model, 'input') + calculate_cost(output_tokens, cheaper_model, 'output')
            saving = row_cost - cheaper_cost
            if saving > 0:
                potential_savings += saving
                analysis_results.append({
                    "row": index, "type": "Overkill Model",
                    "detail": f"Used {model} for a short prompt", "saved": round(saving, 4)
                })

    # AI Summary
    summary_text = f"Analysis Complete. Found {len(analysis_results)} opportunities."
    try:
        prompt = f"Summarize: Cost ${total_cost:.2f}, Savings ${potential_savings:.2f}. One sentence."
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}], model="llama-3.1-8b-instant")
        summary_text = chat_completion.choices[0].message.content
    except: pass

    # SAVE TO DATABASE (History)
    supabase.table('analyses').insert({
        "user_id": user_id,
        "total_cost": round(total_cost, 4),
        "savings_found": round(potential_savings, 4),
        "summary": summary_text
    }).execute()

    return {
        "total_cost": round(total_cost, 4),
        "savings_found": round(potential_savings, 4),
        "issues_count": len(analysis_results),
        "issues": analysis_results[:10], 
        "summary": summary_text
    }