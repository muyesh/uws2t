## 언어 / Languages / 言語 / 语言 / 語言 / Ngôn ngữ

- [English](README.md)
- [日本語](README_ja.md)
- [简体中文](README_zh_CN.md)
- [繁體中文](README_zh_TW.md)
- [繁體中文（香港）](README_zh_HK.md)
- [Tiếng Việt](README_vi.md)
- [한국어](README_ko.md)

# UltraWideSnapperTwoThirds

21:9 울트라와이드 모니터 사용자를 위해 설계된 GNOME Shell 확장 프로그램으로, 키보드 단축키를 사용하여 창을 효율적으로 배치합니다. 이 확장 프로그램을 사용하면 화면의 2/3 또는 1/3 영역에 창을 빠르게 배치할 수 있으며, 왼쪽 또는 오른쪽 정렬을 통해 생산성을 극대화하고 모니터의 너비를 최대한 활용할 수 있습니다.

## 개요

UltraWideSnapperTwoThirds는 네 가지 필수 창 배치 기능을 제공하여 울트라와이드 모니터에서의 멀티태스킹 경험을 향상시킵니다:

- **왼쪽 2/3**: 창을 왼쪽에 화면 너비의 2/3로 배치
- **오른쪽 2/3**: 창을 오른쪽에 화면 너비의 2/3로 배치
- **왼쪽 1/3**: 창을 왼쪽에 화면 너비의 1/3로 배치
- **오른쪽 1/3**: 창을 오른쪽에 화면 너비의 1/3로 배치

**지원 환경:**
- Ubuntu 22.04 (및 호환 배포판)
- GNOME Shell 42.x
- Wayland 세션
- 21:9 울트라와이드 모니터 (권장)

## 빠른 시작

### 전제 조건

설치하기 전에 필요한 도구가 설치되어 있는지 확인하세요:

```bash
# Ubuntu/Debian
sudo apt install gettext glib2.0-dev-bin zip

# Fedora/RHEL
sudo dnf install gettext glib2-devel zip

# Arch Linux
sudo pacman -S gettext glib2 zip
```

### 방법 1: make install 사용

확장 프로그램을 설치하고 활성화하는 가장 빠른 방법:

```bash
# 빌드 및 설치
make install

# GNOME Shell 재시작 (로그아웃 후 다시 로그인)
# 그 다음 확장 프로그램 활성화
gnome-extensions enable uws2t@muyesh.github.io
```

### 방법 2: 수동 설치

설치 과정을 더 세밀하게 제어하려면:

```bash
# 확장 프로그램 빌드
make build

# 확장 프로그램 디렉토리에 복사
cp -r build/uws2t@muyesh.github.io ~/.local/share/gnome-shell/extensions/

# GNOME Shell 재시작 (로그아웃 후 다시 로그인)
# 그 다음 확장 프로그램 활성화
gnome-extensions enable uws2t@muyesh.github.io
```

**중요:** 설치 후에는 로그아웃하고 다시 로그인하여 GNOME Shell을 재시작해야 합니다. GNOME Shell이 재시작되기 전까지는 확장 프로그램이 인식되지 않습니다.

### 설치 확인

확장 프로그램이 활성화되었는지 확인:

```bash
gnome-extensions list --enabled | grep uws2t
```

## 기능

### 창 배치 기능

| 기능 | 기본 단축키 | 설명 |
|------|------------|------|
| 왼쪽 2/3 | `Ctrl+Super+Left` | 창을 왼쪽에 2/3 너비로 배치 |
| 오른쪽 2/3 | `Ctrl+Shift+Super+Right` | 창을 오른쪽에 2/3 너비로 배치 |
| 오른쪽 1/3 | `Ctrl+Super+Right` | 창을 오른쪽에 1/3 너비로 배치 |
| 왼쪽 1/3 | `Ctrl+Shift+Super+Left` | 창을 왼쪽에 1/3 너비로 배치 |

### 작동 원리

각 배치 기능은 세 단계로 작동합니다:

1. **최대화 해제**: 창이 최대화되어 있으면 먼저 최대화를 해제합니다
2. **크기 계산**: 목표 너비(작업 영역의 1/3 또는 2/3)를 결정합니다
3. **배치**: 계산된 위치와 크기로 창을 이동하고 크기를 조정합니다

### 사용자 정의

확장 프로그램 환경설정을 통해 키보드 단축키를 사용자 정의할 수 있습니다:

```bash
gnome-extensions prefs uws2t@muyesh.github.io
```

## 설치 및 빌드

### 빌드 시스템

이 확장 프로그램은 다음과 같은 주요 대상을 가진 Makefile 기반 빌드 시스템을 사용합니다:

| 대상 | 설명 |
|------|------|
| `make build` | 번역 및 스키마 컴파일 |
| `make install` | 확장 프로그램 빌드 및 로컬 설치 |
| `make package` | 배포용 zip 패키지 생성 |
| `make clean-all` | 생성된 모든 파일 제거 |

### 상세 빌드 과정

1. **번역 컴파일** (번역 파일을 수정한 경우):
   ```bash
   make compile-translations
   ```

2. **GSettings 스키마 컴파일**:
   ```bash
   make compile-schemas
   ```

3. **전체 빌드**:
   ```bash
   make build
   ```

4. **배포 패키지 생성**:
   ```bash
   make package
   ```

### 제거

확장 프로그램을 제거하려면:

```bash
make uninstall
```

## 프로젝트 구조

```
uws2t@muyesh.github.io/
├── extension.js              # 메인 확장 프로그램 기능
├── prefs.js                  # 설정/환경설정 UI
├── metadata.json             # 확장 프로그램 메타데이터
├── convenience.js            # 유틸리티 함수
├── schemas/                  # GSettings 스키마
│   ├── org.gnome.shell.extensions.uws2t.gschema.xml
│   └── gschemas.compiled
├── locale/                   # 컴파일된 번역
│   └── */LC_MESSAGES/*.mo
├── po/                       # 번역 소스
│   ├── *.po                  # 번역 파일
│   └── *.pot                 # 번역 템플릿
├── build/                    # 빌드 출력 디렉토리
├── Makefile                  # 빌드 시스템
├── release.sh               # 릴리스 자동화 스크립트
└── validate.sh              # 패키지 검증 스크립트
```

### 주요 파일

- **extension.js**: 메인 창 배치 로직과 키보드 단축키 핸들러를 포함
- **prefs.js**: 단축키 사용자 정의를 위한 환경설정 대화상자 제공
- **metadata.json**: UUID, 버전, 지원되는 GNOME Shell 버전을 포함한 확장 프로그램 메타데이터 정의
- **schemas/**: 사용자 환경설정 저장을 위한 GSettings 스키마 정의 포함

## 개발

### 개발 환경 설정

1. **저장소 복제**:
   ```bash
   git clone https://github.com/muyesh/uws2t.git
   cd uws2t
   ```

2. **개발 의존성 설치**:
   ```bash
   # Ubuntu/Debian
   sudo apt install gettext glib2.0-dev-bin
   ```

3. **테스트용 빌드 및 설치**:
   ```bash
   make install
   ```

### 번역 추가

1. **번역 가능한 문자열 추출**:
   ```bash
   make extract-strings
   ```

2. **기존 번역 업데이트**:
   ```bash
   make update-po
   ```

3. **새 언어 추가** (`LANG`을 언어 코드로 교체):
   ```bash
   # Makefile의 LANGUAGES에 LANG 추가
   # po/LANG.po 파일 생성
   make update-po
   ```

4. **번역 컴파일**:
   ```bash
   make compile-translations
   ```

### 지원 언어

현재 지원되는 언어:
- 영어 (en)
- 일본어 (ja)
- 중국어 간체 (zh_CN)
- 중국어 번체 (zh_TW)
- 중국어 번체 (홍콩) (zh_HK)
- 베트남어 (vi)
- 한국어 (ko)

### 개발 워크플로

1. **소스 파일 수정**
2. **로컬 테스트**:
   ```bash
   make install
   # 로그아웃/로그인하여 GNOME Shell 재시작
   gnome-extensions enable uws2t@muyesh.github.io
   ```
3. **필요시 로그 확인**:
   ```bash
   journalctl -f -o cat /usr/bin/gnome-shell | grep UltraWideSnapperTwoThirds
   ```

## 라이선스

MIT License

Copyright (c) 2025 Shizhuo Muye

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

**참고:** 이 확장 프로그램은 개발 효율성과 코드 품질 향상을 위해 생성형 AI 기술의 지원을 받아 개발되었습니다.
