"""Run integration tests in a disposable database, never in saved player rooms."""

import asyncio
import os
from urllib.parse import urlsplit, urlunsplit
from uuid import uuid4

import asyncpg

from app.config import Settings


def pytest_sessionstart(session):
    admin_url = Settings().database_url
    name = "wilder_test_" + uuid4().hex
    parsed = urlsplit(admin_url)
    test_url = urlunsplit(parsed._replace(path="/" + name))

    async def create():
        connection = await asyncpg.connect(admin_url)
        try:
            await connection.execute(f'CREATE DATABASE "{name}"')
        finally:
            await connection.close()

    asyncio.run(create())
    session.config._wilder_test_database = (admin_url, name, os.environ.get("DATABASE_URL"))
    os.environ["DATABASE_URL"] = test_url


def pytest_sessionfinish(session, exitstatus):
    database = getattr(session.config, "_wilder_test_database", None)
    if database is None:
        return
    admin_url, name, previous = database

    async def drop():
        connection = await asyncpg.connect(admin_url)
        try:
            await connection.execute(f'DROP DATABASE "{name}" WITH (FORCE)')
        finally:
            await connection.close()

    asyncio.run(drop())
    if previous is None:
        os.environ.pop("DATABASE_URL", None)
    else:
        os.environ["DATABASE_URL"] = previous
