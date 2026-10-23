import logging
import sys

def setup_logging():

    log_format = "%(asctime)s | %(name)-15s | %(levelname)-8s | %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"

    logging.basicConfig(
        level=logging.INFO, 
        format=log_format,
        datefmt=date_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            
        ]
    )

    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)