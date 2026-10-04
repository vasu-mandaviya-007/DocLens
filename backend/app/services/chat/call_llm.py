from app.core.ollama_client import ollama_async_client
from app.core.groq_client import groq_async_client

OLLAMA_CHAT_MODEL = "gemma2:2b"  
GROQ_CHAT_MODEL = "openai/gpt-oss-120b"  

async def call_llm(messages): 
    """
    LLM se stream fetch karta hai aur raw text chunks yield karta hai.
    """
    
    stream = await groq_async_client.chat.completions.create(
        model=GROQ_CHAT_MODEL,
        messages=messages,
        stream=True,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta

    # stream = await ollama_async_client.chat(
    #     model=OLLAMA_CHAT_MODEL,
    #     messages=messages, 
    #     stream=True
    # )

    # async for chunk in stream: 
    #     text = chunk.message.content
    #     if text: 
    #         yield text