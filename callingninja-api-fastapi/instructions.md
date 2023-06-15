# Instructions
## Hard Requirements
- python>=3.10
- python-venv
- pip
- all variables in `.env` must be set. See `.envTemplate`

# Run
1. in directory run: `python -m venv venv` (only on first run/initial set up)
2. activate virtual environment: `. venv/bin/activate`
3. on first run and after dependency changes: `pip install -r requirements.txt`
4. run fastapi dev server: `python -m uvicorn callingninja:app --reload`
5. access swagger ui through: `localhost:8000/docs` or documentation though `localhost:8000/redoc`
