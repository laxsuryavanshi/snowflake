FROM python:3.10-slim

EXPOSE 8000

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

ENV DJANGO_ENV=production

WORKDIR /app

RUN adduser -u 5678 --disabled-password --gecos "" iam && chown -R iam /app
USER iam

ENV PATH="/home/iam/.local/bin:${PATH}"

# Install pip requirements
COPY --chown=iam:iam requirements.txt .
RUN python -m pip install -r requirements.txt

COPY --chown=iam:iam . /app

RUN python manage.py collectstatic --noinput

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "iam.wsgi"]
