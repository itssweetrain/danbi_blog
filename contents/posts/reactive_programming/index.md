---
title: "Reactive Programming"
description: "Rxjava"
date: 2022-05-29
update: 2022-05-29
tags:
  - CS
  - Programming Paradigm
  - Reactive Programming
  - Rx
series: "Programming"
---

<img src="https://koenig-media.raywenderlich.com/uploads/2019/05/AndroidReactive-feature.png"/>

## 0. 왜 Reactive?

---

`리액티브(Reactive)` 라는 키워드는 왜 중요해졌을까? 페이스북에서 `리액트(React)` 라이브러리를 만든 이유도 지속적으로 데이터가 변화하는 대규모 애플리케이션을 구축하기 위함에서 출발했다. 데이터가 변경이 되면 리액트는 가상 DOM을 변경하고 이전의 가상 DOM과 비교하여 변경된 부분만 실제 DOM에 적용한다. 이러한 리액트의 렌더링 방식은 애플리케이션의 규모가 클수록, 데이터의 변경이 많을수록 더 큰 힘을 발휘하고 이러한 큰 장점은 현재 프론트엔드의 가장 사랑받는 기술 중 하나가 된 이유이다. 모바일 기기의 증가나 시스템에서 처리하는 이벤트나 데이터가 극단적으로 증가하면서 **사용자의 요청에 바로 반응하여 응답하고 언제 올지 모르는 데이터나 지속적으로 생성되는 데이터에도 대응할 수 있는** `리액티브 프로그래밍(Reactive Programming)`도 한 해결책으로서 프로그래밍 패러다임으로 등장하게 된 것이다.

## 1. 반응형 프로그래밍 with Android

---

반응형 프로그래밍이란 이름처럼 주변 환경과 상호작용을 하고 이에 반응하여 작동하는 프로그래밍이다. `데이터의 스트림`과 `변화`가 중요한데, 반응형 프로그래밍에서는 모든 데이터를 `스트림(stream)`으로 보고 선언한다. 시간이 지남에 따라 발생하는 일련의 이벤트를 스트림이라고 부른다.

예를 들어, GPS 위치 정보가 변경될 때의 데이터 전송 흐름을 생각해보자. 이동해 위치 정보가 변경될 때마다 데이터를 전송하고 이동을 멈추면 데이터 전송도 중지하는 것처럼 생성되는 데이터를 한 번에 보내지 않고 각각의 데이터가 생성될 때마다 순서대로 보낸다. 이러한 데이터 흐름을 스트림(`stream`)이라고 한다. 이미 생성된 데이터 집합인 리스트(`list`)같은 컬렉션(`collection`)과는 다르게 앞으로 발생할 가능성이 있는 데이터까지도 포함하는 데이터 집합이다.

**반응형 프로그래밍은 observer 패턴, 함수형 프로그래밍의 장점과 개념을 접목**했다. 지난 글에서 반응형 프로그래밍은 함수형 프로그래밍의 단짝이라고 했듯이, 함수형 프로그래밍의 영향을 받아 함수형 인터페이스를 인자로 전달받는 메서드가 많다. 이러한 함수형 인터페이스를 사용하는 메서드들을 조합하면 함수형 프로그래밍을 하는 것처럼 데이터를 필터링하거나 변환하는 등의 처리를 유연하게 할 수 있다. 또한 GUI를 갖춘 애플리케이션이 늘어나면서 여러 작업을 동시에 실행해야 하는 일(비동기 처리)도 생겼다. 그래서 이러한 문제에 대한 해결책의 하나로 여러 작업을 동시에 처리할 수 있는 편리한 반응형 프로그래밍이 주목받게 된 것이다.

사용자들은 애플리케이션이 사용자의 요청에 즉각적으로 반응하길 원하며, 반응성이 느린 앱은 결국 사용자들이 떠나게 될 것이다.
동시성 문제, 다중 이벤트 처리, 백그라운드 스레드 처리 등을 다루면서 많은 문제점에 직면하는데 RxJava는 이에 대해 범용적이고 확실한 해결책을 제시한다. 이에 RxJava는 안드로이드를 개발하면서 필수불가결하게 쓰는 라이브러리가 되었고 함께 쓰는 RxAndroid는 RxJava에 Android용 스케쥴러 등 몇 가지 클래스를 추가해 안드로이드 개발을 쉽게 도와준다.

다음은 반응형 프로그래밍의 fundamental 3가지(`1. 이벤트 처리 및 비동기 처리`,`2. observer pattern`,`3. 함수형 인터페이스`) 에 대해 정리해본다.

## 2. 비동기처리

---

> **network operations cannot be run on the main thread.**

**안드로이드는 메인 스레드에서 UI에 관한 처리를 하고 있다.** 즉, 앱이 사용자와 상호작용하는 모든 행동이 메인 스레드에서 이루어진다. 갤러리에 접근하여 파일을 올리고 이 정보를 네트워크로 동기화하여 저장하고 다시 이 파일을 가져와 이미지뷰에 적용하여 띄워주는 기능이 있다고 하자. 파일에 접근하고, 통신을 하고, 이미지뷰에 다시 업데이트하는 과정을 모두 메인 스레드에서 하게 되면 메인 스레드의 역할이 overload되어 처리 시간은 지연될 수밖에 없는 상황에 놓이게 된다.

이 같은 과정은 앱을 사용하는 유저에게는 좋지 않은 경험을 안겨줄 것이다. 대부분의 사용자들은 애플리케이션이 사용자의 요청에 즉각적으로 반응하길 원할 것이고, **안드로이드 OS의 최우선 목표 또한 앱 내부에서 일어나는 작업들이 사용자에게 최적의 경험을 제공해주는 것이다.** 따라서 시간이 오래 걸리는 작업은 메인스레드에서 작업할 수 없도록 되었다. 때때로 마주하게 되는 NetworkOnMainThreadException 에러는 네트워크 작업같이 시간이 오래 걸리는 작업을 메인 스레드에서 수행할 때 발생한다. 이처럼 메인 스레드에서 처리할 수 없는 작업들은 안드로이드 OS에서 이와같은 에러를 친절하게 띄어주며 다르게 처리하기를 유도한다. 이를 해결하기 위해선 해당 작업들을 메인 스레드와 독립적으로 수행될 수 있도록 비동기로 수행하도록 만들어줘야한다. 비동기 처리는 들어온 순서대로 처리하여 결과물을 보여주는 것이 아닌, 대기 시간이 발생하는 일들은 다른 곳에서 제어권을 넘기고 다음 인터렉션을 처리하는 것이다. 결과가 주어지는 시간 동안 다른 작업을 할 수 있으므로 위의 예시의 경우에도 대기 시간이 발생하는 네트워크 통신은 다른 스레드에서 처리하게 해주는 방식으로 비동기처리를 해야한다.

잠시 안드로이드에서의 비동기의 구현 방법에 대해 생각해보면 여러가지가 있으나 대표적으로는 안드로이드에서 제공하는 AsyncTask Class, 반응형 라이브러리인 Coroutine, RxJava 등이 있다. 현재 AsyncTask는 재사용이 불가능하고 메모리의 누수가 발생한다는 점에서 deprecated 되었다.

## 3-1. Observer Design Pattern

---

> **observer is someone who watches or notices something.**

<img src="https://refactoring.guru/images/patterns/content/observer/observer-comic-1-en-2x.png?id=8e89674eb83b01e82203987e600ba59e">

Rx는 `옵저버(Observer)` 디자인 패턴을 따르고 있다. 옵저버는 이름처럼 무언가를 관찰하는 사람으로 해석될 것이다. **옵저버 패턴은 감시 대상 객체의 상태가 변하면 이를 관찰하는 객체에 알려주는 구조이다.** Rx는 이 패턴의 특징을 살리면서 데이터를 생성하는 측(`Publisher`)과 데이터를 소비하는 측(`Subscriber`)으로 나누고 이 때문에 쉽게 데이터 스트림을 처리할 수 있게 하였다.

옵저버 디자인 패턴에서 `subject`는 `observer`라고 불리는 독립적인 객체들에 대한 책임이 있다. 그래서 subject의 state가 변경이 되면 이 subject에 등록되어 있는 object들은 subject의 state가 변경되었다는 알람을 받음과 동시에 자동으로 상태값이 업데이트 된다.

쉬운 예시로, 식당 예약을 관리하는 애플리케이션이 있다고 하자. 예약하고 싶었던 식당이 이미 인원이 다 차버려 예약할 수 없는 상황이라면 사용자들은 예약 대기를 등록해 놓고, 예약이 취소되면 애플리케이션은 등록을 한 대기자들에게 알람을 동시에 보내준다. 여기서 식당(subject)의 예약 마감 상태에서 예약 가능으로 상태 변경이 되면 대기 예약에 등록한(registerObserver) 사용자들(observers)은 동시에 알람을 받을 수 있다. Rx에서는 이 subject가 `observable`이라고 불리며 observer은 `observer`라고 불린다. observable은 events나 data를 방출(`emit`)하고 이렇게 방출된 데이터들을 observer이 받는 형태가 Rx에서 이 디자인패턴을 사용하는 방법이다.

> 우리는 보통 프로그래밍을 할 때, 작성한 명령어들이 우리가 작성한 순서대로 차례대로 실행되어 완성되는 방식에 익숙할 것이다. 이와 달리 ReactiveX에서는 'Observer'에 의해 임의의 순서에 따라 병렬로 실행되고 결과는 나중에 연산된다. 즉, 메서드 호출 보다는, 'Observable' 안에 데이터를 조회하고 변환하는 메커니즘을 정의한 후, Observable이 이벤트를 발생시키면 옵저버의 관찰자가 그 순간을 감지하고 준비된 연산을 실행시켜 결과를 리턴하는 메커니즘 때문에, Observable을 구독한다고 표현하는 것이 올바를 것이다. - Reactive Document

> In ReactiveX an observer subscribes to an Observable. Then that observer reacts to whatever item or sequence of items the Observable emits. - Reactive Document

observer가 observable을 구독하는 시점에 observable은 observer와 함께 작동한다. 이 observer는 observable이 방출하는 것에 반응하고, observable이 방출하는 것을 반응해야하기 때문에 observable을 감시하고 있는 것이다. 이렇게 observable에 구독한 observer는 observable이 방출하는 어떠한 시퀀스나 데이터에 즉각적으로 반응할 수 있다. 이렇게 구독한 observer들은 서로에게 의존적이지 않고 독립적이기 때문에 observable이 동시에 무언가를 방출한다 하더라도 각자의 작업을 할 수 있는 것이고, 여러 작업을 동시에 실행시킬 수 있기 때문에 비동기적으로 함수를 호출할 수 있는 것이다.

## 3-2. How Observable Works

---

<iframe src="https://pl.kotl.in/3zzGgWxmd?theme=darcula" width="100%" height="100"></iframe>

observable interface는 subscribe 메소드를 가지고, 이 메소드는 observer가 observable에 subscribe 할 수 있도록 invoke하는 역할을 한다. 그리고 observable에 subscribe을 한 후에는 observer는 observable에게 세 개 타입의 이벤트들을 전달한다.

첫 번째는, onNext()이다. observable은 데이터를 방출 할 때마다 observer의 onNext 함수를 호출한다. onNext 함수는 인자로 observable로부터 방출된 데이터를 갖게 된다. 두 번째는, onComplete()이다. onNext 함수 호출을 마지막으로 한 후 더 이상의 방출할 데이터가 없거나 이벤트가 정상적으로 끝났을 때 onComplete 함수를 호출한다. 모든 emissions이 완료되었음을 알 수 있다. 마지막으로 onError()는 observable이 데이터를 방출하는 것을 실패했거나 다른 에러가 발생했을 경우 호출하며 에러 객체와 함께 에러를 통지한다. 반응형 프로그래밍에서의 에러는 데이터 플로우에서 나오는 한 데이터처럼 다뤄진다. 이 처럼 서로 다른 세 개의 채널이 있다고 생각하고, observable의 `pipeline`이 끝나면 결과값에 따라 최종 목적지인 한 개의 채널로 데이터가 전달될 것이다.

## 4. 함수형 인터페이스

---

observable이 observer로 데이터를 방출하기 전에, 우리는 필요에 맞게 데이터를 가공하여 보내줘야하는 경우도 있을 것이다. (예를 들어 `merge`,`modify`,`reduce`,`filter`...라든지) 그리고 새로운 값으로 탄생한 observable로 반환할 것이다. 이처럼 데이터를 변환하는 메서드를 Rx에서는 `operators` 라고 하고 이 함수들에 의해 upstream의 observable에서 연산자를 연결해나감으로써 최종목적지인 downstream의 observable로 반환한다.

<iframe src="https://pl.kotl.in/lHuMKEkTR?theme=darcula" width="100%" height="100%"></iframe>

함수형 프로그래밍의 장점을 접목했기에 메서드 대부분이 함수형 인터페이스를 인자로 받는다. 그래서 이 함수형 인터페이스의 구현은 함수형 프로그래밍의 원칙에 따라 같은 입력값을 받으면 같은 결과를 반환하고 외부 환경에 의해 변화가 일어나지 않아야한다. 때문에 부수효과가 발생하는 처리는 메서드 체이닝 도중이 아니라 최종적으로 데이터를 받아 처리하는 subscriber쪽에서 이루어지는 것이 좋다.

## 참고자료

---

- 스다 토모유키, RxJava 리액티브 프로그래밍
- ReactiveX documentation
- https://refactoring.guru/ko/design-patterns/observer
