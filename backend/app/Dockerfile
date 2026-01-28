FROM python:3.12

WORKDIR /usr/src/server
ADD requirements.txt .
RUN pip install -r requirements.txt
RUN pip install pytest

CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000", "--log-level", "debug"]
