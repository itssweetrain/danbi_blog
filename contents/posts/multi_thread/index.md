---
title: "Scheduler로 Multi Thread 관리하기"
description: "RxJava"
date: 2022-08-25
update: 2022-08-25
tags:
  - RxJava
---

## Scheduler로 Multi Thread 관리하기

---

Rx를 이용하면 여러 스레드를 사용해 어떤 작업을 수행하는 도중에도 다른 작업을 실행하는 비동기작업을 할 수 있다. Rx에서는 비동기 처리를 수행하는데 필요한 API를 제공하므로 기존에 구축한 비즈니스 로직에 영향을 주지 않고도 데이터를 통지하는 생산자 측의 처리와 데이터를 받는 측의 처리를 분리하며 서로 다른 스레드에서 실행할 수 있다. 즉 생산자가 무엇을 하더라도 소비자가 받은 데이터의 범주에서만 작업을 하게 된다면 비동기로 쉽게 전환하며 교체할 수 있다. 또한 용도별로 적절히 스레드를 관리하는 클래스를 제공해 직접 스레드를 관리해야 하는 번거로움도 없다는 편리함이 있다. Rx에서 제공해주는 operator들을 적절히 사용하여 스레드 관리를 해보자.

## 1) Scheduler

---

RxJava에서는 **개발자가 직접 스레드를 관리하지 않게 각 처리 목적에 맞춰 스레드를 관리**하는 `스케쥴러(Scheduler)`를 제공한다.
<br>

이 스케줄러를 설정하면 어떤 스레드에서 무엇을 처리할지 제어할 수 있다. 이 Scheduler라는 개념은 멀티스레드 환경에서 여러 스레드간의 Observable들의 흐름을 관장하는 역할을 한다. 스케쥴러는 데이터 생성의 기본이 되는 `생산자(Observable)`에 지정할 수도 있고 데이터의 수신 처리를 하는 `소비자(Observer)`에서도 지정할 수 있다. 전자는 데이터 통지를 어떤 스케줄러에서 처리할 지를 제어할 수 있고 후자는 데이터의 수신 처리를 어느 스케줄러에서 할 지를 제어하고 전환하며 비동기처리를 할 수 있는 것이다.

안드로이드에서 많이 쓰는 스케줄러로는,

> - `Schedulers.io()` : 동기 I/O를 별도로 처리시켜 비동기 효율을 얻기 위한 스케쥴러. 자체적인 스레드 풀인 CachedThreadPool을 사용한다. API 호출 등 네트워크를 사용한 호출 시 사용된다.
> - `Schedulers.computation()` : 이벤트 룹에서 간단한 연산이나 콜백 처리를 위해 사용된다.RxComputationThreadPool라는 별도의 스레드 풀에서 돌아간다. 최대 cpu갯수 개의 스레드 풀이 순환하면서 실행된다.
> - `Schedulers.immediate()` : 현재 스레드에서 즉시 수행한다. observeOn()이 여러번 쓰였을 경우 immediate()를 선언한 바로 윗쪽의 스레드를 따라간다.
> - `Schedulers.from(executor)` : 특정 executor를 스케쥴러.
> - `Schedulers.newThread()` : 새로운 스레드를 만드는 스케쥴러.
> - `Schedulers.trampoline()` : 큐에 있는 일이 끝나면 이어서 현재 스레드에서 수행하는 스케쥴러.
> - ` AndroidSchedulers.mainThread()`: 안드로이드의 UI 스레드에서 동작.
> - `HandlerScheduler.from(handler)` : 특정 핸들러 handler에 의존하여 동작.

## 2) observeOn, subscribeOn

---

스케쥴러는 `subsctibeOn`, `observeOn` 함수에서 각각 지정할 수 있다.

멀티스레드를 사용하여 여러가지 작업을 Observable 연산자로 묶어 수행하는 경우가 있다. 가령 백그라운드 스레드에서는 네트워크 작업, 많은 연산이 필요한 작업을 해야하고 화면에 보여주기 위해서는 메인 스레드에서 작업을 해야한다. 이 작업들은 Observable 연산자로 묶어 만들 수 있으므로 각각의 작업에 맞게 스레드 지정을 해야한다. 이 때 각각의 작업에 맞게 스레드 지정을 도와주는 메소드가 `observeOn`,`subscribeOn`이다. subscribeOn와 observeOn를 모두 지정하면 Observable에서 데이터 흐름이 발생하는 스레드와 처리된 결과를 구독자에게 발행하는 스레드를 분리할 수 있다. RxJava 스케줄러의 핵심은 결국 제공되는 스케줄러의 종류를 선택한 후 subscribeOn과 observeOn 함수를 호출하는 것이다.

<br>

> - `subscribeOn`<br> **Observable이 어느 스레드에서 작업할 지 지정.** Observable에서 구독자가 subscribe 함수를 호출했을 때 데이터 흐름을 발생하는 스레드를 지정. <br>
>
>   Many implementations of ReactiveX use “Schedulers” to govern an Observable’s transitions between threads in a multi-threaded environment. You can instruct an Observable to do its work on a particular Scheduler by calling the Observable’s SubscribeOn operator.

> - `observeOn`<br> **처리된 결과를 구독자에게 전달하는 스레드를 지정** <br>
>
>   The ObserveOn operator is similar, but more limited. It instructs the Observable to send notifications to observers on a specified Scheduler.

<br>

그래서 무엇을 먼저써야하고, 같이 쓸 때는 어떤경우이며 사용하지 않으면 어느 스레드에서 작동할까?
<br>

**subscribeOn은 Observable이 어떤 스레드에서 오퍼레이팅을 시작할지 정해주고 이후 추가 적인 오퍼레이션이나 스레드를 변경하고 싶을 시 observeOn을 사용하면 된다. observeOn로 작업마다 원하는 스레드로 변경할 수 있다.**

subscribeOn은 여러번 호출되더라도 맨 처음 지정한 스레드를 고정시키므로 맨 처음 호출만 영향을 주며 어디에 위치하든 상관없다. 하지만 observeOn은 특정 작업의 스케쥴러를 변경할 수 있어 여러번 호출될 수 있으며 이후에 실행되는 연산에 영향을 주므로 위치가 중요하다.

subscribeOn만 호출하면 처음 지정한 스레드만 지정한 것이므로 Observable의 모든 흐름이 동일한 스레드에서 실행된다.
스케줄러를 별도로 지정하지 않으면 현재(main)스레드에서 동작을 실행한다.

<br>

<img src="https://reactivex.io/documentation/operators/images/schedulers.png" width="85%">

<br>

위 마블다이어그램의 예시를 보자.
<br>
subscribeOn은 호출 시점에 상관없이 Observable이 어떤 스레드에서 오퍼레이팅을 시작할지 정해준다고 하였다. subscribeOn은 map 오퍼레이터 이후 호출되고 있지만, Observable이 오퍼레이팅을 시작하는 곳은 subscribeOn이 지정한 파란색 삼각형에서 시작하고 있다. 맨 처음 호출하는 observeOn에서는 주황색 삼각형으로 스레드를 작동하길 변경하였으므로 그 다음의 연산은 주황색 삼각형에서 실행되고 있다. 두 번째 observeOn에서는 분홍색 삼각형으로 스레드를 지정해주었고 그 이후의 Observable은 분홍색 삼각형에서 실행되고 있다. 이러한 특징으로 Observable 오퍼레이터들이 체이닝 되는 시점에 여러번 observeOn을 사용할 수 있고 그 이후의 스레드 흐름에 영향을 주는 것을 볼 수 있다.

코드로 예시를 보면,

```jsx
Observable.just("print") //UI
    .map (str -> str.size()) //UI
    .observeOn(Schedulers.computation()) // 스레드변경
    .map (size -> size * 2) //Schedulers.computation()에서 실행
    .subscribe(num -> Log.d("num", num)) // Schedulers.computation()에서 실행
```

<br>

subscribe을 호출하면 먼저 Observable.just() 작업이 실행되고, 해당 작업 스레드는 subscribeOn을 지정해주지 않았으므로 main 스레드가 될 것이다. observeOn(Schedulers.computation()) 을 통해 작업 스레드는 Computation으로 스레드가 변경될 것이고 이 후 처리되는 size \* 2 연산은 RxComputationThreadPool 스레드에서 일어날 것이다.

<br>

만약 subscribeOn을 두 번 사용한다면 어떻게 될까?

```jsx
Observable.just("print")
  .map(str -> str.size())
  .subscribeOn(Schedulers.computation()) // Schedulers.computation()로 스레드 변경
  .subscribeOn(Schedulers.io()) // Schedulers.io()로 변경되지 않음
  .subscribe(number -> Log.d("", "Number " + number));
```

<br>

맨 처음 지정한 subscribeOn만 실질적으로 실행될 것이다. subscribeOn은 여러번 호출되더라도 맨 처음 지정한 스레드만 고정시킨다.

<br>

```jsx
val observable: Observable<Int> = Observable.create { subscriber ->
    // 해당 작업은 subscribeOn(AndroidSchedulers.mainThread()) 로 인해 main 쓰레드로 동작함
    for (i in arrayOf(1, 2, 3, 4, 5)) {
        Log.d(
            "runRx mainThread",
            Thread.currentThread().name + " : onNext " + i
        )
        subscriber.onNext(i)
        if (i == 5) {
            subscriber.onComplete()
        }
    }
}
observable
    .subscribeOn(AndroidSchedulers.mainThread())
    .observeOn(Schedulers.io()) // 아래 작업은 observeOn(Schedulers.io()) 로 인해 RxCachedThreadScheduler 쓰레드로 동작함
    .doOnNext { i ->
        Log.d(
            "runRx io",
            Thread.currentThread().name + " : onNext " + i
        )
    }
    .observeOn(Schedulers.computation()) // 아래 작업은 observeOn(Schedulers.computation()) 로 인해 RxComputationThreadPool 쓰레드로 동작함
    .doOnNext { i ->
        Log.d(
            "runRx computation",
            Thread.currentThread().name + " : onNext " + i
        )
    }
    .observeOn(Schedulers.newThread()) // 아래 작업은 observeOn(Schedulers.newThread()) 로 인해 RxNewThreadScheduler 쓰레드로 동작함
    .subscribe(object : Observer<Int?> {
        override fun onSubscribe(d: Disposable) {
            Log.d("runRx onSubscribe", Thread.currentThread().name)
        }

        override fun onNext(t: Int) {
            Log.d("runRx onNext", Thread.currentThread().name)
        }

        override fun onError(e: Throwable) {
            Log.d("runRx onError", Thread.currentThread().name)
        }

        override fun onComplete() {
            Log.d("runRx onComplete", Thread.currentThread().name)
        }
    })
```

```jsx
D/runRx onSubscribe: main
D/runRx mainThread: main : onNext 1
D/runRx mainThread: main : onNext 2
D/runRx mainThread: main : onNext 3
D/runRx mainThread: main : onNext 4
D/runRx mainThread: main : onNext 5
D/runRx io: RxCachedThreadScheduler-1 : onNext 1
D/runRx io: RxCachedThreadScheduler-1 : onNext 2
D/runRx io: RxCachedThreadScheduler-1 : onNext 3
D/runRx io: RxCachedThreadScheduler-1 : onNext 4
D/runRx io: RxCachedThreadScheduler-1 : onNext 5
D/runRx computation: RxComputationThreadPool-1 : onNext 1
D/runRx computation: RxComputationThreadPool-1 : onNext 2
D/runRx computation: RxComputationThreadPool-1 : onNext 3
D/runRx computation: RxComputationThreadPool-1 : onNext 4
D/runRx computation: RxComputationThreadPool-1 : onNext 5
D/runRx onNext: RxNewThreadScheduler-1
D/runRx onNext: RxNewThreadScheduler-1
D/runRx onComplete: RxNewThreadScheduler-1
```

<br>

실제 일반적으로 사용하는 방법은 별도의 스레드에서 작업 한 후 결과를 메인 스레드로 보여준다.

<br>

```jsx
val observable: Observable<Int> = Observable.create { subscriber ->
    for (i in arrayOf(1, 2, 3, 4, 5)) {
        Log.d(
                "runRx mainThread",
                Thread.currentThread().name + " : onNext " + i
        )
        subscriber.onNext(i)
    }
}
    observable
        .subscribeOn(Schedulers.computation())
        .observeOn(AndroidSchedulers.mainThread())
        .subscribe(object: Observer<Int?> {
            override fun onSubscribe(d: Disposable) {
                Log.d("runRx onSubscribe", Thread.currentThread().name)
            }

            override fun onNext(t: Int) {
                Log.d("runRx onNext", Thread.currentThread().name)
            }

            override fun onError(e: Throwable) {
                Log.d("runRx onError", Thread.currentThread().name)
            }

            override fun onComplete() {
                Log.d("runRx onComplete", Thread.currentThread().name)
            }
        })
```

```jsx
D/runRx onSubscribe: main
D/runRx mainThread: RxComputationThreadPool-1 : onNext 1
D/runRx mainThread: RxComputationThreadPool-1 : onNext 2
D/runRx mainThread: RxComputationThreadPool-1 : onNext 3
D/runRx mainThread: RxComputationThreadPool-1 : onNext 4
D/runRx mainThread: RxComputationThreadPool-1 : onNext 5
D/runRx onNext: main
D/runRx onNext: main
```

## 참고자료

---

- <a href="https://reactivex.io/documentation/operators/subscribeon.html">ReactiveX Document</a>

- https://medium.com/upday-devs/rxjava-subscribeon-vs-observeon-9af518ded53a
