---
title: 오늘 배운 것
date: 2026-05-29
description: 클로드 코드로 블로그를 만들면서 HTML, CSS, JavaScript가 각각 어떤 역할을 하는지 정리했다.
tags: [til, web]
---

클로드 코드와 함께 마크다운 블로그를 처음부터 만들어봤다. 프레임워크 없이 순수 웹 기술만 쓰다 보니 HTML, CSS, JavaScript가 각자 어떤 일을 하는지 훨씬 선명하게 보였다.

## HTML — 뼈대

HTML은 페이지의 **구조**를 담당한다. 어떤 콘텐츠가 있고, 그것들이 어떤 관계인지 정의한다.

```html
<article>
  <header>
    <h1 id="post-title"></h1>
    <div id="post-meta"></div>
  </header>
  <div id="post-body"></div>
</article>
```

이 블로그에서 HTML이 하는 일은 딱 하나다. "여기에 제목이 들어가고, 여기에 본문이 들어간다"고 자리를 잡아두는 것. 실제 내용은 JavaScript가 나중에 채운다.

## CSS — 옷

CSS는 HTML 요소에 **시각적인 스타일**을 입힌다. 색, 크기, 여백, 배치가 모두 CSS의 영역이다.

이번에 가장 유용하게 쓴 기능은 **CSS 커스텀 프로퍼티**(변수)다. 라이트/다크 모드를 구현할 때 색상을 한 곳에서 관리할 수 있었다.

```css
:root {
  --bg: #ffffff;
  --text: #1a1a1a;
}

[data-theme="dark"] {
  --bg: #0f0f0f;
  --text: #e8e8e8;
}
```

`data-theme` 속성 하나만 바꾸면 페이지 전체 색이 바뀐다. 모든 요소가 같은 변수를 참조하기 때문이다.

## JavaScript — 움직임

JavaScript는 페이지에 **동작**을 부여한다. 데이터를 가져오고, HTML을 동적으로 생성하고, 사용자 이벤트에 반응한다.

이 블로그에서 JavaScript가 하는 일은 크게 세 가지다.

1. **데이터 로드** — `fetch()`로 `index.json`과 마크다운 파일을 읽어온다.
2. **렌더링** — 읽어온 마크다운을 HTML로 변환해 페이지에 삽입한다.
3. **인터랙션** — 다크모드 토글 버튼 클릭을 감지하고 테마를 전환한다.

```js
document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('blog-theme', next)
})
```

## 세 가지의 관계

결국 세 기술은 이런 역할 분담을 한다.

| 기술 | 역할 | 비유 |
|---|---|---|
| HTML | 구조 | 건물의 뼈대 |
| CSS | 스타일 | 인테리어 |
| JavaScript | 동작 | 전기·배관 |

프레임워크를 쓰면 이 경계가 흐릿해지는 경우가 많다. 순수하게 세 가지만 써보니 각자의 역할이 훨씬 명확하게 느껴졌다.
