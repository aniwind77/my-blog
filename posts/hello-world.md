---
title: Hello, aniwind!
date: 2026-05-29
description: 마크다운 블로그의 첫 번째 포스트입니다. 지원하는 문법을 모두 확인해보세요.
tags: [general, markdown]
---

마크다운 블로그에 오신 것을 환영합니다. 이 포스트는 지원하는 모든 마크다운 문법을 보여줍니다.

## 텍스트 스타일

**굵은 텍스트**와 _기울임 텍스트_, 그리고 `인라인 코드`를 사용할 수 있습니다.

## 목록

순서 없는 목록:

- 첫 번째 항목
- 두 번째 항목
- 세 번째 항목

순서 있는 목록:

1. 첫 번째
2. 두 번째
3. 세 번째

## 인용구

> 좋은 코드는 그 자체로 설명된다.
> 주석이 필요한 코드는 먼저 리팩터링을 고려해보세요.

## 코드 블록

```javascript
function greet(name) {
  return `Hello, ${name}!`
}

console.log(greet('World'))
```

```python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print(list(fibonacci(10)))
```

## 링크와 이미지

[GitHub](https://github.com)에서 더 많은 프로젝트를 확인해보세요.

## 구분선

---

## 새 포스트 추가하는 방법

1. `posts/` 폴더에 `YYYY-MM-DD-slug.md` 형식으로 파일을 만듭니다.
2. 파일 상단에 프론트매터를 작성합니다.
3. `posts/index.json`에 메타데이터를 추가합니다.

이것으로 끝입니다. 즐거운 블로깅 되세요!
