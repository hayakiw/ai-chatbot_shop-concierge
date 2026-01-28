from logging_config import setup_logging
setup_logging()

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import time
from config import Settings
from routers import root, chat, admin_log
# import os
app = FastAPI(debug=Settings.APP_DEBUG == "true")

# # Get frontend URL from environment variable, fallback to localhost
# frontend_url = Settings.APP_FRONTEND_URL   os.getenv("FRONTEND_URL", "http://localhost:3000")

origins = [
    # frontend_url,
    "http://localhost:3000",
    "https://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include router
app.include_router(root.router)
app.include_router(chat.router)
app.include_router(admin_log.router)

@app.middleware('http')
async def add_process_time_header(request: Request, call_next):
 start_time = time.time()
 response = await call_next(request)
 process_time = time.time() - start_time
 response.headers['X-Process-Time'] = str(process_time)
 return response

@app.exception_handler(ValueError)
async def value_error_exception_handler(request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={"detail": "A ValueError occurred: " + str(exc)}
    )