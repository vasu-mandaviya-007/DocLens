import logging
import sys

def setup_logging():
    # Log ka format: [Date Time] [File Name] [INFO/ERROR] - Message
    log_format = "%(asctime)s | %(name)-15s | %(levelname)-8s | %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"

    # Basic config set kar rahe hain
    logging.basicConfig(
        level=logging.INFO, # Debugging ke time ise DEBUG kar sakte hain
        format=log_format,
        datefmt=date_format,
        handlers=[
            # 1. Terminal par color ke sath (basic) print karne ke liye
            logging.StreamHandler(sys.stdout),
            
            # 2. File mein save karne ke liye (Optional, server par kaam aayega)
            # logging.FileHandler("backend_errors.log") 
        ]
    )

    # FastAPI/Uvicorn ke default noise (faltu logs) ko thoda kam karne ke liye
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)