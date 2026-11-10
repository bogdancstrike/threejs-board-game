from pathlib import Path
import secrets
path=Path('.env')
if path.exists():
 print('.env already exists; preserved existing credentials.')
else:
 password=secrets.token_urlsafe(30)
 path.write_text(f'POSTGRES_USER=wilder\nPOSTGRES_DB=wilder\nPOSTGRES_PASSWORD={password}\nDATABASE_URL=postgresql://wilder:{password}@127.0.0.1:55432/wilder\n')
 path.chmod(0o600)
 print('Created .env with a generated database password.')
