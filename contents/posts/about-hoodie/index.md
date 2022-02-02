---
title: "Tasks and the Back Stack"
description: "안드로이드 기기에 물리 키로 있는 back button, 홈 키, 최근 앱 키를 눌렀을 때 어떤 액티비티들이 보여지고 어떤 순서로 작동하는지에 대해 알고자 정리하는 글"
date: 2022-02-01
update: 2022-02-01
tags:
  - Android
  - Activity
series: ""
---

> 안드로이드 기기에 물리 키로 있는 back button, 홈 키, 최근 앱 키를 눌렀을 때 어떤 액티비티들이 보여지고 어떤 순서로 작동하는지에 대해 알고자 정리하는 글

## 1. Task & Back Stack

> A task is a stack of activities

안드로이드 앱을 실행했을 때, 우리의 눈에 첫 번째로 보이는 것은 첫 번째로 실행되는 액티비티일 것이다. 사용자의 행동에 의해 다른 액티비티로 이동하면, 이동한 액티비티 화면이 사용자에게 보여진다. 이렇게 실행된 액티비티들은 어디에 존재할까?

이 실행된 액티비티들은 Task라는 곳에 존재하게 된다. 설령 서로 다른 앱에 속한 activity들이라 하더라도 이 activitiy들은 같은 'task'에 있음으로써 사용자에게 자연스러운 사용자 경험을 제공할 수 있는 것이다.

이처럼 task는 사용자에 의해 실행된 activity들의 모음이다. 이 activity들이 생성되면서 인스턴스들은 back stack이라는 곳에 저장된다. back stack은 이처럼 액티비티들의 인스턴스를 가지고 있기에, 같은 액티비티의 여러개의 인스턴스도 저장할 수 있고 즉 같은 액티비티를 여러개 시작할 수 있다는 의미이다.

## 2. How does stack work

살짝 자바스크립트를 공부했을 때를 떠올려, 마치 자바스크립트의 call stack과 같은 원리를 가진다.

call stack은 어떤 함수들이 현재 실행되고 있고, 어떤 함수들이 그 함수 안에서 호출됐는지 keeping track 하기 위해 만들어진 메커니즘이다. 함수를 호출 했을 때, call stack에 추가가 되고, 함수가 실행되고 호출 된 함수로부터 호출된 어떤 함수 또한 그 위로 차곡히 쌓이게 되는데 이 작동원리와 비슷하다.

앱 실행 후, 순서대로 실행된 액티비티 인스턴스들은 백 스택에 아래의 그림처럼 저장된다.

처음 실행된 Activity1은 Foreground에 나올 것이고, 차례 대로 Activity2, Activity3을 실행한다면 차례대로 백 스택에 push된다. 맨 위에 있는 액티비티 인스턴스를 Top이라고 표현하고, Activity3은 현재 포커스를 갖고있고 사용자와 상호작용하고 있는 액티비임을 알 수 있다.

그렇다면 쌓여있는 액티비티들은? 이전 Activity1, Activity2은 백 스택에 남아있지만 중지된 상태를 갖는다. 이 때, 사용자가 기기의 백 버튼을 누르면 현재 보여지고 있는 Activity3은 맨 위에서 pop되어 제거되고 Activity2의 UI가 복원된다. 마치 finish() 함수와 같은 역할을 하고, 사용자가 원래 있던 곳을 다시 보여준다.

액티비티 안에 띄워지는 fragment 또한 마찬가지이다. 액티비티 안에 존재하는 프래그먼트가 더 이상 존재하지 않을 때까지 계속 pop 되어지다 해당 액티비티 또한 pop되어 백 스택에서 제거된다.

즉, back stack은 이 처럼 `LIFO(Last In First Out)` 선입선출 방식의 객체구조로 작동한다.

사용자가 뒤로가기 버튼을 누르면 현재 활동이 제거되고 저장되어 있던 이전 활동이 다시 시작된다.

## 3. Activity LifeCycle

백 스택에서 액티비티들이 푸쉬/팝이 일어나는 순간에 액티비티 수명 주기 상태도 변화한다.

Activity2에서 Activity3를 실행시켰을 때,

Activity3의 인스턴스가 백 스택에 푸쉬되고, Activity2의 수명 주기 상태는 STOPPED가 된다. 대신 UI에 대한 상태는 보존된다.

백 버튼을 눌러서 현재 사용자가 마주하고 있는 Activity3는 팝되어 백스택에서 제거될 때는,

`DESTROYED` 상태가 된 후 메모리에서 제거되고, 탑의 위치에 있는 Activity2는 RESUMED 상태가 되어 다시 실행된다. 이 때, 저장되었던 Activity2의 UI상태가 복구된다.

## 4. 홈 키 또는 최근 앱 키를 눌렀을 때

백 버튼을 눌렀을 때는, 사용자에게 보여지고 있는 액티비티가 백 스택에서 제거된 다는 것은 알았다.

그렇다면, 홈 키 또는 최근 앱 키를 눌렀을 때는 어떻게 될까?

예제처럼 Activity3과 상호작용하는 과정에서 사용자가 홈 키를 누르면 Activity3이 존재하는 테스크 자체가 Background로 들어간다. 사용자가 다시 이 앱을 실행시키면 테스크가 다시 Foreground로 돌아오고 백 스탭의 Top이었던 Activity3이 사용자에게 보이게 된다.

최근 앱 키를 눌렀을 때는, 현재 백그라운드로 들어가 있는 테스크들의 목록을 볼 수 있다. 목록의 테스크 중 다시 포그라운드로 돌아오게 하여 상호작용하고 싶은 테스크를 선택하면 해당 포그라운드로 돌아온다.

이렇게 안드로이드 시스템은 백그라운드와 포그라운드를 태스크 단위로 왔다 갔다 자유롭게 이동할 수 있도록 지원한다. 이 때문에 안드로이드에서 멀티 태스킹이 가능한 것이다

## 5. Flag를 사용하여 Task내 액티비티의 흐름 제어하기

now, if instead of hitting the Back button, you were to hit the Home button, the whole task is put in the background.

There are two specific cases where you might want to do something special.

First, if you're calling start activity with the activity you're already on.

Instead of piling up activity after activity, and requiring multiple presses of the Back button, you can add a launch mode of single top to your activities manifest entry. Or include flag activity single top in your intent.

Instaed of a new instance of your activity being created every time you call start activity, you get a call back to on new intent. And users will be able to hit the Back button just once to return to the previous activity.

참고문서

https://developer.android.com/guide/components/activities/tasks-and-back-stack
