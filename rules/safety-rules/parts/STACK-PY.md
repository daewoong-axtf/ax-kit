# Python + FastAPI 규칙

Python 백엔드 코드에 적용한다. 지향점: 요청을 받는 층, 업무 로직 층, DB 층을 나눈 단순한 계층 구조. 모든 입출력은 Pydantic 모델로 형식을 정한다.

## PY-1. 버전과 도구

- Python 3.15를 쓰고 `.python-version`에 패치까지 적는다. `pyproject.toml`에는 `requires-python = "==3.15.*"`를 둔다.
- 패키지 관리는 uv만 쓴다. 의존성은 `pyproject.toml`에 `==`로 고정하고 `uv.lock`을 커밋한다. `requirements.txt`·`Pipfile`·`poetry.lock`이 있으면 uv로 옮긴다.
- 자동·일괄 업그레이드(`uv lock --upgrade`, `pip install -U`)는 사용자 확인 없이 실행하지 않는다. 취약점 점검은 `pip-audit`로 한다.
- lint·포맷은 Ruff 하나로 한다. 설정은 `pyproject.toml`에 두고, lint 규칙은 `[tool.ruff.lint]`에 `select = ["E", "F", "W", "I", "B", "UP", "S", "SIM"]`을 기본으로 한다. pytest는 `assert`로 검증하므로 `[tool.ruff.lint.per-file-ignores]`에 `"tests/**" = ["S101"]`을 둔다. 이 예외는 규칙 파일이 정한 기본값이므로 사용자 확인 없이 둔다. Black·isort·flake8 설정이 있으면 Ruff로 옮기고 지운다.
- 타입 검사는 mypy로 한다. 설정은 `[tool.mypy]`에 `strict = true`, `plugins = ["pydantic.mypy"]`.
- 실행 명령을 맞춘다.
  - lint: `uv run ruff check .`
  - 포맷: `uv run ruff check --fix . && uv run ruff format .`
  - 타입 검사: `uv run mypy app`
  - 테스트: `uv run pytest`
  - 실행: `uv run uvicorn app.main:app`(`--reload`는 개발에서만)

## PY-2. 프로젝트 구조

템플릿이 없으면 아래 구조를 쓴다.

```txt
app/
  main.py              # FastAPI 앱 생성, 라우터·예외 처리 등록
  core/config.py       # 설정(pydantic-settings, 환경 변수)
  core/security.py     # 로그인 사용자 확인, 권한 확인 함수
  core/db.py           # DB 연결·세션
  api/routers/         # 기능별 엔드포인트 파일
  schemas/             # 요청·응답 Pydantic 모델
  services/            # 업무 로직
  repositories/        # DB 조회·저장
  clients/             # 외부 시스템·API 호출(Gateway)
  models/              # SQLAlchemy 테이블 모델
migrations/            # Alembic 마이그레이션
tests/
```

- 파일·함수·변수는 snake_case, 클래스는 PascalCase, 상수는 UPPER_SNAKE_CASE로 쓴다.
- 한 파일이 300줄을 넘으면 기능별로 나눈다.

## PY-3. 아키텍처

- 호출 방향은 router → service → repository 한 방향이다. router에서 DB를 직접 조회하지 않는다. service와 repository는 HTTP 요청·응답 객체를 모른다.
- 요청·응답은 Pydantic v2 모델로 정의하고 라우터에 `response_model`을 적는다. dict나 DB 모델 객체를 그대로 반환하지 않는다(필요 없는 필드와 개인정보가 함께 나간다, 4번).
- 입력 검증(9번)은 Pydantic 필드 제약(`Field(max_length=...)` 등)으로 한다.
- DB는 SQLAlchemy 2.x(`select()` 방식)로 다룬다. 테이블 구조 변경은 Alembic 마이그레이션으로만 한다. 운영에서 `create_all`로 테이블을 만들지 않는다.
- SQLite에서 옮길 때는 SQLAlchemy 연결 URL과 드라이버를 PostgreSQL용으로 바꾸고 Alembic으로 PostgreSQL용 마이그레이션을 새로 만든다("SQLite를 PostgreSQL로 옮기기"). 연결 URL은 `core/config.py`가 환경 변수 `DATABASE_URL`에서 읽는다.
- DB 세션과 로그인 사용자는 `Depends`로 주입한다. 권한 확인 함수는 `core/security.py` 한 곳에 두고 모든 라우터가 `Depends`로 쓴다(10번).
- 한 프로젝트 안에서 동기(`def`)와 비동기(`async def`) 방식을 섞지 않는다. 템플릿을 따르고, `async def` 안에서 동기 DB 드라이버나 블로킹 호출을 쓰지 않는다.
- 외부 HTTP 호출은 httpx로 하고 timeout을 반드시 지정한다(14번).

## PY-4. 코드 스타일

- 모든 함수의 인자와 반환값에 타입 힌트를 단다.
- 설정은 `core/config.py`의 `Settings(BaseSettings)` 한 곳에서 읽는다. 다른 곳에서 `os.environ`을 직접 읽지 않는다.
- 로그는 `logging`으로 남긴다. `print`를 쓰지 않는다(12번).
- 업무 오류는 직접 만든 예외 클래스로 던지고, `main.py`에 등록한 예외 처리기에서 HTTP 응답으로 바꾼다. 응답에 traceback을 넣지 않는다. `except Exception: pass`처럼 오류를 삼키지 않는다.

## PY-5. 운영 설정

- 운영에서는 `debug=False`로 실행하고, API 문서 화면(`/docs`, `/redoc`, `/openapi.json`)을 끄거나 로그인 뒤로 둔다.
- CORS는 프론트엔드 주소만 허용한다. `allow_origins=["*"]`를 쓰지 않는다.

## PY-6. 테스트와 전환

- 테스트는 pytest와 FastAPI `TestClient`로 `tests/`에 둔다. 권한 테스트(15번)는 `app.dependency_overrides`로 다른 사용자를 넣어 차단되는지 확인한다.
- 테스트가 없는 프로젝트는 엔드포인트마다 `TestClient`로 현재 응답을 기록하는 특성 테스트를 만든다(syrupy 스냅샷). 외부 HTTP 호출은 respx로 가짜 응답을 준다. 테스트 DB는 테스트마다 새로 만든다. Testcontainers(Docker)나 로컬에 설치한 PostgreSQL로 운영과 같은 엔진을 쓴다. SQLite로 대신하지 않는다. 둘 다 쓸 수 없으면 사용자에게 알리고 PostgreSQL을 쓸 방법을 확인받는다.
- 시나리오(S-n)는 `tests/scenarios/`에 `TestClient` 테스트로 만들고 함수 이름에 시나리오 ID를 넣는다(`test_s01_...`). TDD 단위 테스트는 `tests/unit/`에 둔다.
- Streamlit·Gradio·Flask·Django 앱을 옮길 때는 계산·데이터 처리 함수를 `services/`로 옮겨 재사용하고, 화면은 TS 규칙으로 새로 만든다.

## PY-7. 아키텍처 패턴과 리팩토링

| 위치(PY-2)             | PoEAA 패턴                                                |
| ---------------------- | --------------------------------------------------------- |
| `api/routers/`         | Remote Facade: 얇은 진입점. 검증·호출·응답 변환만         |
| `schemas/`             | DTO                                                       |
| `services/`            | Service Layer: 업무 흐름과 트랜잭션 경계                  |
| `repositories/`        | Repository                                                |
| `models/` + SQLAlchemy | Data Mapper. `Session`이 Unit of Work와 Identity Map 역할 |
| `clients/`             | Gateway: 외부 시스템·API 호출을 감싼다                    |

- 업무 로직은 Transaction Script(요청 하나 = 서비스 함수 하나)로 시작한다. 같은 규칙이 여러 서비스에 반복되거나 상태 변화 규칙이 복잡해지면 그때 Domain Model(모델 객체의 메서드)로 옮긴다.
- DB 모델과 API 스키마를 한 클래스로 겸용하지 않는다(SQLModel `table=True` 모델을 응답으로 반환하지 않는다).
- 트랜잭션 커밋은 service에서 한다. repository는 commit하지 않는다. 요청 하나에 세션 하나를 쓴다.
- 목록 조회에서 연관 데이터를 쓰면 `selectinload`·`joinedload`를 명시해 N+1 조회를 막는다. 비동기 세션에서는 지연 로딩에 기대지 않는다.
- 여러 사람이 같은 데이터를 고칠 수 있으면 버전 컬럼(`version_id_col`)으로 Optimistic Lock을 건다.
- Python에 맞게 바꿔 적용한다.
  - 상속 관련 기법보다 함수, 합성, `Protocol`을 먼저 쓴다.
  - 기본형을 객체로 바꾸기·매개변수 객체 만들기 → `@dataclass(frozen=True)`나 Pydantic 모델로 만든다.
  - 조건부 로직을 다형성으로 바꾸기 → 딕셔너리 매핑이나 `match` 문을 먼저 검토한다.
  - 단계 쪼개기 → 파일 업로드 처리는 "읽기 → 검증 → 변환 → 저장" 함수로 나눈다.
  - 모듈 전역 변수에 상태를 두지 않는다(13번).

## PY-8. FastAPI + HTML 화면

FastAPI가 HTML 화면을 직접 제공하는 구조는 새 앱과 기존 앱 모두 쓸 수 있다. 기존 앱은 Next.js로 옮기지 않아도 되고, 새 앱은 "스택 판별"의 기준으로 정한다. 이 구조에는 TS 규칙(TS-1~TS-9)을 적용하지 않고 아래를 따른다.

- HTML은 `app/templates/`, JavaScript·CSS는 `app/static/`에 둔다. 실제 업무 데이터는 두지 않는다(3번). 한 파일이 300줄을 넘으면 기능별로 나눈다.
- 화면은 그리기와 API 호출만 맡는다. 업무 로직, DB 접근, 권한 판단은 백엔드에 둔다(10번).
- API 호출은 공통 함수 한 곳에서만 한다.
- 사용자 입력과 서버 응답은 `textContent`로 넣는다. HTML로 그려야 하면 DOMPurify로 정리한 뒤 넣는다(9번).
- 서버에서 HTML에 데이터를 채우면 Jinja2를 쓰고 자동 이스케이프를 끄지 않는다. 사용자 입력과 서버 응답에 `|safe`를 쓰지 않는다(9번).
- 외부 스크립트는 파일을 내려받아 `app/static/`에서 제공하고, 버전을 파일 이름이나 `README.md`에 남긴다. 외부 URL에서 불러오지 않는다(11번).
- 보안 헤더(11번)는 가장 바깥 미들웨어에서 오류·리다이렉트를 포함한 모든 응답에 적용한다.
- 로그인·권한·핵심 흐름(15번)은 Playwright E2E 테스트로 `tests/e2e/`에 둔다. 화면이 없는 시나리오는 PY-6을 따른다.

## PY-9. 파일 저장

- 업로드·생성 파일의 저장 위치는 `UPLOAD_DIR` 환경 변수로 읽고, 값이 없으면 `./uploads`를 쓴다(17번). 경로를 코드에 직접 쓰지 않는다.
- 사용자가 보낸 파일 이름은 그대로 경로에 붙이지 않고, 정해진 폴더 밖으로 나가지 못하게 검사한다(9번). 아래 예시는 위치를 읽는 부분만 보여 준다.

```python
import os

UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

path = os.path.join(UPLOAD_DIR, file.filename)
```

## PY-10. 앱 시작 명령 (Procfile)

FastAPI(Python) 앱은 프로젝트 맨 위 폴더에 **`Procfile`** 파일이 꼭 있어야 한다. 서버가 앱을 어떻게 실행할지 이 파일을 보고 정한다. 없으면 빌드가 실패한다.

FastAPI 프로젝트를 만들어도 이 파일은 자동으로 생기지 않으니 직접 만든다. (Next.js·Spring Boot는 필요 없다.)

### 만드는 법

프로젝트 맨 위 폴더(`pyproject.toml`이 있는 곳)에 확장자 없이 `Procfile`이라는 파일을 만들고 한 줄을 적는다.

```txt
web: uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
```

- `app.main:app`은 "**`app` 폴더의 `main.py` 안에 있는 `app` 객체**"라는 뜻이다. 내 프로젝트 위치에 맞게 바꾼다.

| 내 코드 위치 | Procfile |
| --- | --- |
| `main.py` (맨 위 폴더) | `web: uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}` |
| `app/main.py` | `web: uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}` |
| `src/myapp/main.py` | `web: uvicorn myapp.main:app --app-dir src --host 0.0.0.0 --port ${PORT:-8080}` |

- DB 테이블을 Alembic으로 만들면 앞에 붙인다.

```txt
web: alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
```

- `uvicorn`은 `uv add uvicorn`으로 추가한다(자동으로 설치되지 않는다).
- 내 PC에서 개발할 때는 `uv run uvicorn …`으로 실행한다. 앱허브에 올리면 서버가 Procfile의 `uvicorn …` 줄을 실행한다. 빌드 때 의존성이 설치되어 있으므로 `uv run`이 필요 없다.

### 포트는 숫자로 적지 않는다

포트는 서버가 환경 변수 `PORT`로 알려 준다. 위 예시처럼 **`${PORT:-8080}`으로** 적어야 한다. `--port 8000`처럼 숫자를 적으면 빌드는 되지만 앱이 열리지 않는다. `PORT`는 서버가 자동으로 넣어 주므로 앱허브 '환경변수'에 넣지 않아도 된다.

### Dockerfile은 쓰이지 않는다

서버는 Dockerfile을 읽지 않는다. Dockerfile에 실행 명령을 적어도 반영되지 않으니 실행 명령은 꼭 `Procfile`에 적는다.

### 내 PC에서 확인

```bash
PORT=8080 uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

서버처럼 환경 변수 `PORT`를 읽어 포트를 정하는 방식으로 실행한다. `http://localhost:8080/docs`(FastAPI 기본 문서 화면)가 열리면 앱이 `PORT`를 읽어 켜진다는 것이 확인된 것이고, 서버에서도 같은 방식으로 실행된다.

### AI 코딩 도구에 알려 줄 문장

사용자가 AI 코딩 도구에 FastAPI 앱의 실행·배포 설정을 요청하면 아래 문장을 쓰도록 안내한다.

> 이 FastAPI 앱은 Google Buildpacks로 빌드돼. 프로젝트 맨 위에 `Procfile`을 만들고 `web: uvicorn <모듈>:app --host 0.0.0.0 --port ${PORT:-8080}` 한 줄을 적어 줘(모듈 경로는 실제 main.py 위치대로). 포트는 숫자로 적지 말고 PORT 환경 변수를 써. Dockerfile은 쓰이지 않으니 실행 명령은 Procfile에만 둬. uvicorn은 `uv add uvicorn`으로 의존성에 넣고, 내 PC에서는 `uv run uvicorn …`으로 실행해 줘. 진입 파일을 옮기면 Procfile도 같이 고쳐.
