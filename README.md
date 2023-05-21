# [Numble] E-commerce 마이크로 서비스 설계 딥다이브

# 2023-05-21 개선


----
## 제출 회고록
https://velog.io/@fadfad_/Numble-E-commerce-%EB%A7%88%EC%9D%B4%ED%81%AC%EB%A1%9C-%EC%84%9C%EB%B9%84%EC%8A%A4-%EC%84%A4%EA%B3%84-%EB%94%A5%EB%8B%A4%EC%9D%B4%EB%B8%8C-%ED%9A%8C%EA%B3%A0%EB%A1%9D
# 목차

1. 요구사항 정리
2. 기능

   2.1 디자인 아키텍처

   2.2 DB

   2.3 API

3. Installation

   3.1 without docker

   3.2 with docker

4. 테스트

   4.1 유닛 테스트

   4.2 e2e 테스트

   4.3 성능 테스트


# 1. 요구사항 정리

# 목적

- 범용적인 쿠폰 시스템 마이크로 서비스 개발
    - 할인 쿠폰 발급 기능 개발

# 목표

- 쿠폰 마이크로 서비스를 만든다
    - 유저가 쿠폰을 발급받고, 사용할 수 있도록 하는 시스템을 만든다
- 이벤트 (쿠폰 발급)의 예상 요청 부하는 최대 1500RPS 이다
- 스케일 아웃 처리를 고려해야한다
    - 동시성 이슈 해결 필요

# 고려해야할 사항

- 쿠폰을 수정할때 수량을 늘리거나 줄일 수 있는가 ?
    - 쿠폰 수정을 어디까지 허용해줄 것인가 ?
        - 쿠폰에서 `정해진 수량 → 무제한 수량의 쿠폰으로 변경할 수 없도록 제한`한다.
            - 정해진 수량에서 count 를 업데이트 할 시 수량이 증가된다.
        - 쿠폰의 할인율, 절대적인 금액할인의 수정은 허용한다.
            - 하지만 이미 발급받은 유저는 수정되지 않는다.
- 쿠폰 읽기 시
    - 유효기간이 지난 쿠폰은 보여주지 않는다.
- 스케일 아웃 처리를 고려해야한다.
    - 동시성 이슈 락에 대한 처리가 필요하다.

# 고려하지 않을 사항

- user와 product에 unique 한 문자열을 사용한다
- 유저의 인증, 인가는 고려하지 않는다
    - 로그인 등, 받는 데이터를 통해 실제 사용자가 맞는가를 판단하지 않는다.
    - userId만 을 가지고 판단한다
        - But, 같은 userId로 동일한 쿠폰 발급은 제한한다.

# 2. 기능

### 기술 스택

| Category | Tech Stack |  |  |
| --- | --- | --- | --- |
| Runtime | Node |  |  |
| Language | Typescript |  |  |
| Framework | NestJs |  |  |
| ORM | Prisma |  |  |
| Database | Postgresql | Redis |  |
| Test | jest |  |  |
| Performance Test | k6 | grafana |  |
| Other | gRPC | npm | github action |

# 2.1 디자인 아키텍처

![Untitled Diagram drawio](https://user-images.githubusercontent.com/49264688/235345880-a24eeecb-2563-49ec-9b3e-32b71e23e585.png)

- Redis
    - Redis 는 '유저에게 쿠폰 발급'시 발급 가능한 상태인지 확인하기 위해 사용됩니다.
    - 쿠폰 발급 시 RDB 는 데이터 write 을 책임지고 이외에는 redis 에서 사용합니다.

# 2.2 Database

## ERD

![ERD](https://user-images.githubusercontent.com/49264688/235345892-be5d6a60-5e4a-4db6-ba3f-9844f110f8c4.PNG)

## DB

- `delete 는 전부 soft delete 로 처리`합니다.
    - deleted_at 컬럼에 date가 존재할경우 삭제한 레코드입니다.

### coupons

| columns | data type | not null | 설명 |
| --- | --- | --- | --- |
| id | serial4 | true | PK)  |
| name | varchar(100) | true | 쿠폰 이름 |
| type | int4 | true | 쿠폰 타입 1) 수량 존재, 2) 수량이 존재하지 않음 |
| count | int4 | true | 수량이 존재할시 초기 재고, 존재하지 않을 경우 0 |
| start_date | timestamp(3) | true | 쿠폰 발급 시작 시간 |
| end_date | timestamp(3) | true | 쿠폰 발급 종료 시간 |
| expire_minute | int4 | true | 발급 이후 만료 시간 (단위 분)  |
| discount_type | int4 | true | 쿠폰 할인 타입 1) 할인율  2) 절대 할인 금액 |
| discount_amount | int4 | true | 할인 타입에 따른 할인 양 type 1) 1~100 2) x > 0 |
| created_at | timestamp(3) | true | 레코드 생성 시간 |
| updated_at | timestamp(3) | true | 레코드 업데이트 시간 |
| deleted_at | timestamp(3) | false | 레코드 삭제 시간 |

### user_coupons_storage

| columns | data type | not null | 설명 |
| --- | --- | --- | --- |
| id | serial4 | true | PK)  |
| user_id | text | true | 유저 id |
| coupon_id | int4 | true | FK) coupons.id |
| coupon_number | int4 | true | 발급받은 해당 coupon 번호 |
| product_id | text | false | 사용하고자 하는 물품 id |
| give_date | timestamp(3) | true | 쿠폰 발급 받은 날짜 시간 |
| used_date | timestamp(3) | false | 쿠폰 사용 날짜 시간 |
| expire_date | timestamp(3) | true | 발급 이후 만료 날짜 시간 |
| discount_type | int4 | true | 쿠폰 할인 타입 1) 할인율  2) 절대 할인 금액 |
| discount_amount | int4 | true | 할인 타입에 따른 할인 양 type 1) 1~100 2) x > 0 |
| created_at | timestamp(3) | true | 레코드 생성 시간 |
| updated_at | timestamp(3) | true | 레코드 업데이트 시간 |
| deleted_at | timestamp(3) | false | 레코드 삭제 시간 |

### coupons_history

- 해당테이블은 coupon 이 update , delete 되었을 경우 history를 위한 테이블 입니다.

| columns | data type | not null | 설명 |
| --- | --- | --- | --- |
| id | serial4 | true | PK)  |
| coupon_id | int4 | true | FK) coupons.id |
| name | varchar(100) | true | 쿠폰 이름 |
| type | int4 | true | 쿠폰 타입 1) 수량 존재, 2) 수량이 존재하지 않음 |
| count | int4 | true | 수량이 존재할시 초기 재고, 존재하지 않을 경우 0 |
| start_date | timestamp(3) | true | 쿠폰 발급 시작 시간 |
| end_date | timestamp(3) | true | 쿠폰 발급 종료 시간 |
| expire_minute | int4 | true | 발급 이후 만료 시간 (단위 분)  |
| discount_type | int4 | true | 쿠폰 할인 타입 1) 할인율  2) 절대 할인 금액 |
| discount_amount | int4 | true | 할인 타입에 따른 할인 양 type 1) 1~100 2) x > 0 |
| description | text | false | 비고 |
| created_at | timestamp(3) | true | 레코드 생성 시간 |
| updated_at | timestamp(3) | true | 레코드 업데이트 시간 |
| deleted_at | timestamp(3) | false | 레코드 삭제 시간 |

### user_coupons_stograge_history

- user_coupon_storage 에서 유저가 해당 쿠폰을 삭제, 사용취소 등 업데이트 되었을 경우 기록을 위한 테이블입니다.

| columns | data type | not null | 설명 |
| --- | --- | --- | --- |
| id | serial4 | true | PK) |
| user_coupon_id | int4 | true | FK) user_coupons_storage.id |
| product_id | text | false | 사용하고자 하는 물품 id |
| used_date | timestamp(3) | false | 쿠폰 사용 날짜 시간 |
| description | text | false | 비고 |
| created_at | timestamp(3) | true | 레코드 생성 시간 |
| updated_at | timestamp(3) | true | 레코드 업데이트 시간 |
| deleted_at | timestamp(3) | false | 레코드 삭제 시간 |

# 2.3 API

- 특이사항
    - body 의 date는 string으로 아래와 같은 형식으로 받습니다.
        - (ex: ”2023-04-23T15:05:51”)
    - null은 “”로 표기합니다.

## CouponProto

### `coupon/CouponService`

### 발급 가능한 쿠폰 보기

- method : FindAll
- Request body

    ```jsx
    {}
    ```

- Response

    ```json
    {
    	"coupons": [
    		{
    			"id": 1,
    			"name": "수량쿠폰",
    			"type": 1,
    			"count": 100000,
    			"startDate": "Sat Apr 29 2023 09:00:00 GMT+0900 (대한민국 표준시)",
    			"endDate": "Wed May 10 2023 09:00:00 GMT+0900 (대한민국 표준시)",
    			"expireMinute": 7200,
    			"discountType": 1,
    			"discountAmount": 50,
    			"createdAt": "Sat Apr 29 2023 15:36:22 GMT+0900 (대한민국 표준시)",
    			"updatedAt": "Sat Apr 29 2023 15:36:22 GMT+0900 (대한민국 표준시)",
    			"deletedAt": "",
    			"couponsStock": 100000,
    			"_couponsStock": "couponsStock"
    		},
    		{
    			"id": 2,
    			"name": "수량없는쿠폰",
    			"type": 2,
    			"count": 0,
    			"startDate": "Sat Apr 29 2023 09:00:00 GMT+0900 (대한민국 표준시)",
    			"endDate": "Wed May 10 2023 09:00:00 GMT+0900 (대한민국 표준시)",
    			"expireMinute": 7200,
    			"discountType": 1,
    			"discountAmount": 50,
    			"createdAt": "Sat Apr 29 2023 15:36:22 GMT+0900 (대한민국 표준시)",
    			"updatedAt": "Sat Apr 29 2023 15:36:22 GMT+0900 (대한민국 표준시)",
    			"deletedAt": ""
    		}
    	]
    }
    ```

- 설명
    - `발급 가능한 모든 coupon을 보여줍니다.`
    - 수량이 존재하는 쿠폰의 경우
        - couponsStock 는 남은 쿠폰 수량을 말합니다.


### 쿠폰 생성

- method : Create
- Request body

    ```json
    {
    	"name": "수량쿠폰", 
    	"type": 1, 
    	"count": 100000,
    	"startDate": "2023-04-23T15:00:00",
    	"endDate": "2023-05-30T15:00:00", 
    	"expireMinute": 7200, 
    	"discountType": 1, 
    	"discountAmount": 50
    }
    ```

- Response

    ```json
    {
    	"id": 4,
    	"name": "수량쿠폰",
    	"type": 1,
    	"count": 100000,
    	"startDate": "Sun Apr 23 2023 15:00:00 GMT+0900 (대한민국 표준시)",
    	"endDate": "Tue May 30 2023 15:00:00 GMT+0900 (대한민국 표준시)",
    	"expireMinute": 7200,
    	"discountType": 1,
    	"discountAmount": 50,
    	"createdAt": "Sun Apr 30 2023 15:44:19 GMT+0900 (대한민국 표준시)",
    	"updatedAt": "Sun Apr 30 2023 15:44:19 GMT+0900 (대한민국 표준시)",
    	"deletedAt": ""
    }
    ```

- 설명
    - 관리자에 의해 쿠폰을 ‘생성’합니다.
    - type
        - 수량이 존재할 경우
            - type: 1
            - `count는 반드시 0보다 커야`합니다.
        - 수량이 존재하지 않을 경우
            - type: 2
            - `count는 반드시 0`이어야 합니다.
    - discountType
        - 할인율
            - discountType: 1
            - discountAmount의 값은 `1~100 사이의 값`이어야합니다.
        - 절대적인 할인 금액
            - discountType: 2
            - doscountAmoutn의 값은 `0보다 커야 합니다.`

### 쿠폰 수정

- method: Update
- Request Body

    ```json
    {
    	"couponId": 4, // int32 
    	"name": "수량쿠폰", // string
    	"type": 1, // int32
    	"count": 100, // int32
    	"startDate": "2023-04-23T15:00:00", // string
    	"endDate": "2023-05-30T15:00:00", //string
    	"expireMinute": 7200, // int32
    	"discountType": 1, // int32
    	"discountAmount": 50 // int32
    }
    ```

- Response

    ```json
    {
    	"id": 4,
    	"name": "수량쿠폰",
    	"type": 1,
    	"count": 100100,
    	"startDate": "Sun Apr 23 2023 15:00:00 GMT+0900 (대한민국 표준시)",
    	"endDate": "Tue May 30 2023 15:00:00 GMT+0900 (대한민국 표준시)",
    	"expireMinute": 7200,
    	"discountType": 1,
    	"discountAmount": 50,
    	"createdAt": "Sun Apr 30 2023 15:44:19 GMT+0900 (대한민국 표준시)",
    	"updatedAt": "Sun Apr 30 2023 15:49:39 GMT+0900 (대한민국 표준시)",
    	"deletedAt": ""
    }
    ```

- 설명
    - 수정하고자 하는 coupon
        - couponId 를 지정
    - 수정하고자 하는 정보
        - 변경하지 않고자 하는 정보는 이전 데이터를 그대로 작성.
        - 변경하고자 하는 정보는 수정
        - 주의사항
            - type
                - `type은 변경할 수 없습니다!`
                    - `변경시 error 반환`
            - count
                - 수량이 존재하는 경우 count 값은 `변경이 아닌 stack 입니다.`
                - ex) 기존 : 100 , 업데이트 : 100
                    - count : 200 으로 변경

### 쿠폰 삭제

- method: Delete
- Request body

    ```json
    {
    	"couponId": 4 //int32 삭제하고자 하는 coupons.id
    }
    ```

- Response

    ```json
    {
    	"id": 4,
    	"name": "수량쿠폰",
    	"type": 1,
    	"count": 100100,
    	"startDate": "Sun Apr 23 2023 15:00:00 GMT+0900 (대한민국 표준시)",
    	"endDate": "Tue May 30 2023 15:00:00 GMT+0900 (대한민국 표준시)",
    	"expireMinute": 7200,
    	"discountType": 1,
    	"discountAmount": 50,
    	"createdAt": "Sun Apr 30 2023 15:44:19 GMT+0900 (대한민국 표준시)",
    	"updatedAt": "Sun Apr 30 2023 15:52:39 GMT+0900 (대한민국 표준시)",
    	"deletedAt": "Sun Apr 30 2023 15:52:39 GMT+0900 (대한민국 표준시)"
    }
    ```

- 설명
    - 삭제하고자 하는 couponId 를 전송합니다.
    - 삭제된 데이터가 전송받습니다
        - deletedAt을 통해 언제 삭제되었는지 기록됩니다. (soft delete)
    - 이미 삭제된 경우 재 요청시 error 를 반환합니다.

## UserCouponProto

### user_coupon/UserCouponService

### 유저에게 쿠폰 발급

- method: Give
- Request Body

    ```json
    {
        "userId": "user_id_1234", // string 발급하고자 하는 유저 id
        "couponId": 1 // int32 발급 받고자 하는 coupon id
    }
    ```

- Response

    ```json
    {
        "isReceived": true
    }
    ```

- 설명
    - 유저의 쿠폰 발급 받기 기능
    - 발급하고자 하는 userId와 발급받고자 하는 couponId를 전송합니다.
    - 쿠폰의 endDate 가 종료되지 않으면 발급 가능합니다.
    - 쿠폰은 1인당 1개만 발급 가능합니다.
    - 재고가 없는 coupon 일 경우 발급에 성공합니다.
    - 재고가 존재하는 coupon 일 경우
        - 재고가 존재하는지 체크 한 후 발급합니다.

### 유저의 쿠폰 읽기

- method: FindAll
- Request Body

    ```json
    {
    	"userId": "user_id_1234" // string
    	"take": 1 // int32 가져오고자 하는 유저의 쿠폰 개수
    	"couponIdCursor": 287303 // optional int32 cursor pagination 지원
    }
    ```

- Response

    ```json
    {
    	"userCouponStorages": [
    		{
    			"id": 287304,
    			"userId": "user_id_1234",
    			"couponId": 1,
    			"couponNumber": 171370,
    			"productId": "",
    			"giveDate": "Sun Apr 30 2023 15:55:40 GMT+0900 (대한민국 표준시)",
    			"usedDate": "",
    			"expireDate": "Fri May 05 2023 15:55:40 GMT+0900 (대한민국 표준시)",
    			"createdAt": "Sun Apr 30 2023 15:55:40 GMT+0900 (대한민국 표준시)",
    			"updatedAt": "Sun Apr 30 2023 15:55:40 GMT+0900 (대한민국 표준시)",
    			"deletedAt": "",
    			"Coupons": {
    				"id": 1,
    				"name": "수량쿠폰",
    				"type": 1,
    				"count": 100000,
    				"startDate": "Sat Apr 29 2023 09:00:00 GMT+0900 (대한민국 표준시)",
    				"endDate": "Wed May 10 2023 09:00:00 GMT+0900 (대한민국 표준시)",
    				"expireMinute": 7200,
    				"discountType": 1,
    				"discountAmount": 50,
    				"createdAt": "Sat Apr 29 2023 15:36:22 GMT+0900 (대한민국 표준시)",
    				"updatedAt": "Sat Apr 29 2023 15:36:22 GMT+0900 (대한민국 표준시)",
    				"deletedAt": ""
    			},
    			"_Coupons": "Coupons"
    		}
    	]
    }
    ```

- 설명
    - userId 가 발급받은 모든 만료되지 않은 쿠폰을 보여줍니다.
    - couponIdCursor
        - `userCouponStorage의 id를 사용`
        - no offset pagination을 위함
        - optional

### 유저의 쿠폰 사용

- Method: Use
- Request body

    ```json
    {
    	"id": 287304, // int32 userCouponStorages.id
    	"userId": "user_id_1234", //string
    	"couponId": 1, //int32 coupons.id
    	"productId": "product_1234" //string
    }
    ```

- Response

    ```json
    {
    	"id": 287304,
    	"userId": "user_id_1234",
    	"couponId": 1,
    	"couponNumber": 171370,
    	"productId": "product_1234",
    	"giveDate": "Sun Apr 30 2023 15:55:40 GMT+0900 (대한민국 표준시)",
    	"usedDate": "Sun Apr 30 2023 16:01:27 GMT+0900 (대한민국 표준시)",
    	"expireDate": "Fri May 05 2023 15:55:40 GMT+0900 (대한민국 표준시)",
    	"createdAt": "Sun Apr 30 2023 15:55:40 GMT+0900 (대한민국 표준시)",
    	"updatedAt": "Sun Apr 30 2023 16:01:27 GMT+0900 (대한민국 표준시)",
    	"deletedAt": ""
    }
    ```

- 설명
    - 해당 유저의 발급받은 쿠폰을 사용하는 API 입니다.
    - id
        - FindAll 을 통해 받아온 userCouponStorages 의 id를 사용합니다
    - 이미 사용한 쿠폰일 경우 error 를 반환합니다.
    - 해당 id와 couponId, userId를 통해 error 를 반환합니다.
        - couponId가 동일하지 않을 경우
        - 다른 user의 쿠폰일 경우

### 유저의 쿠폰 사용 취소

- method: UseCancel
- Request Body

    ```json
    {
    	"id": 287304, //int32 userCouponStorages.id
    	"userId": "user_id_1234", //string 
    	"couponId": 1 //int32 coupons.id
    }
    ```

- Response

    ```json
    {
    	"id": 287304,
    	"userId": "user_id_1234",
    	"couponId": 1,
    	"couponNumber": 171370,
    	"productId": "",
    	"giveDate": "Sun Apr 30 2023 15:55:40 GMT+0900 (대한민국 표준시)",
    	"usedDate": "",
    	"expireDate": "Fri May 05 2023 15:55:40 GMT+0900 (대한민국 표준시)",
    	"createdAt": "Sun Apr 30 2023 15:55:40 GMT+0900 (대한민국 표준시)",
    	"updatedAt": "Sun Apr 30 2023 16:40:08 GMT+0900 (대한민국 표준시)",
    	"deletedAt": ""
    }
    ```

- 설명
    - 유저가 사용했던 쿠폰을 취소합니다.
    - id
        - request에 존재하는 id
        - userCouponStorages.id
    - 이미 취소한 유저 쿠폰일 경우 재 요청시 error 반환

### 유저의 쿠폰 삭제

- Method: Delete
- Request Body

    ```json
    {
    	"id": 287304, // int32  userCouponStorages.id
    	"userId": "user_id_1234", // userId
    	"couponId": 1 // int32 coupons.id
    }
    ```

- Response

    ```json
    {
    	"id": 287304,
    	"userId": "user_id_1234",
    	"couponId": 1,
    	"couponNumber": 171370,
    	"productId": "",
    	"giveDate": "Sun Apr 30 2023 15:55:40 GMT+0900 (대한민국 표준시)",
    	"usedDate": "",
    	"expireDate": "Fri May 05 2023 15:55:40 GMT+0900 (대한민국 표준시)",
    	"createdAt": "Sun Apr 30 2023 15:55:40 GMT+0900 (대한민국 표준시)",
    	"updatedAt": "Sun Apr 30 2023 16:42:04 GMT+0900 (대한민국 표준시)",
    	"deletedAt": "Sun Apr 30 2023 16:42:04 GMT+0900 (대한민국 표준시)"
    }
    ```

- 설명
    - 유저 쿠폰을 삭제합니다.
    - 이미 삭제한경우 error 를 반환합니다.
    - deleteAt에 삭제된 날짜를 표기합니다.

# 3. Installation

### Requirements

- node js 설치
    - [링크](https://nodejs.org/ko/download)
- jest 설치, dotenv-cli 설치
    - jest
        - 테스트 실행을 위해 설치 필요
    - dotenv-cli
        - env 환경 파일을 위한 설치 필요

```shell
$ npm i -g jest dotenv-cli
```

- Database
    - postgresql
    - redis
- Database에 대한 설치는 따로 작성하지 않겟습니다.
    - 설정값은 다음 파일을 참조하여 세팅하거나, 변경해야합니다.
        - .env
            - 개발 환경
        - .env.production
            - 배포 환경
        - .env.production.docker
            - docker 로 실행할 시 필요
        - .env.test
            - e2e 테스트 시 필요
- `database의 스키마는 prisma ORM 으로 생성합니다.`

### 3.1 without docekr

- postgresql, redis가 설치 및 세팅이 완료되었다는 가정하에 작성
- node 의존성 설치

```bash

git clone https://github.com/FonDitbul/numble-coupon.git

cd ./numble-coupon

npm i

npm run build
```

- prisma 를 이용한 db migrate 실행
    - prisma/schema.prisma
        - 해당파일에 정의한 스키마를 DB 테이블로 만들어줍니다.

```bash
# 개발 환경일 경우 .env 파일 수정 필요

npm run migrate:dev

# 배포 환경일 경우 .env.production 파일 수정 필요

npm run migrate:prod
```

- 실행

```bash
# 개발 환경일 경우 .env 파일 수정 필요

npm run start:dev

# 배포 환경일 경우 .env.production 파일 수정 필요

npm run start:prod
```
![nest_실행](https://user-images.githubusercontent.com/49264688/235345922-98c012c9-87ff-4aae-be6c-19ad4cf6b986.png)

### 3.2 with docekr  compose

```bash
git clone https://github.com/FonDitbul/numble-coupon.git

cd ./numble-coupon

npm i

npm run build

sudo docker compose up —build
```

- docker 가 실행 완료되었다면
    - 다음 명령어를 통해 docker postgres에 스키마를 만들어야합니다.

```bash
# .env.production.docker 파일 확인 필요함
npm run migrate:docker
```

# 4. 테스트

### 4.1 유닛 테스트

- 실행

```bash
npm run test
```

![유닛테스트실행](https://user-images.githubusercontent.com/49264688/235345934-c5309644-cc1d-410c-b6bb-04ed056051a2.png)

- 특정 test 파일만 보고싶은 경우

    ```bash
    jest <파일명>
    ```

- coupon.service.sepc.ts
    - 결과
   
![coupon_service_spec_ts](https://user-images.githubusercontent.com/49264688/235345943-7ff1763a-11cc-4b15-86ce-8ce6a1bbf79f.png)

- user.coupon.service.sepc.ts
    - 결과

![user_coupon_service_spec_ts](https://user-images.githubusercontent.com/49264688/235345954-92d915b1-25a5-49d9-8334-4c98014f5f29.png)

### 4.2 E2E 테스트

- e2e.test
- e2e 테스트의 경우 docker compose를 활용하여 진행 할 수도 있습니다.
- .env.test의 {DATABASE_URL} 만 맞춰서 수정해야합니다.
- database schema 설정

    ```bash
    npm run test:migrate
    ```

- 실행

    ```bash
    npm run test:e2e
    ```

- 결과

![e2e_test](https://user-images.githubusercontent.com/49264688/235345962-d3861cbe-c2f8-4ae1-92c9-fe90274579f7.png)


### 4.3 성능 테스트

- 성능 테스트 server spc
    - lenovo ideapad 330S 노트북 사용
        - 운영체제 ubuntu 22.04.2 LTS
        - CPU **i5-8250U (1.6GHz)**
        - RAM 8G
- 성능테스트는 k6
    - [k6 설치하기](https://k6.io/docs/get-started/installation/)
- 시각화는 grafana를 사용하였습니다.
    - [grafana-k6 으로 부하 테스트 하기](https://velog.io/@heka1024/Grafana-k6%EC%9C%BC%EB%A1%9C-%EB%B6%80%ED%95%98-%ED%85%8C%EC%8A%A4%ED%8A%B8%ED%95%98%EA%B8%B0)
- 실행 커맨드

    ```bash
    cd ./numble-coupon/performance-test
    
    # 실행 커맨드
    k6 script.js 
    
    # grafana 시각화 인 경우 
    k6 run \
      --out influxdb=http://localhost:8086/myk6db \
      script.js
    ```

- 부하 테스트는 ‘쿠폰 발급’ 에 대한 테스트만 진행하였습니다.

### 쿠폰 발급 부하 테스트 시나리오
    - 30분 마다 100, 150, 200, 150, 100 의 경우를 테스트 하였다.
    - 해당 user는 발급 가능한 모든 쿠폰(FindAll) 을 부른 후 발급(Give) 한다.
        - 총 2개의 API를 호출합니다.
1. 100만개의 쿠폰이 있을 때 vues 100 ~ 200 인 경우

    ```bash
    checks ............: 94.96% 991524 x 52569
    data_received .....: 982MB 109kB/s
    data_sent .........: 311MB 35kB/s
    group_dauration....: avg=116.43ms min=9.95ms med=70.87ms max=1.33s p(90)=272.76ms p(95)=336.93ms
    grpc_req_duration..: avg=58.01ms min=1.28ms med=15.19ms max=1.32.s p(90)=185.58ms p(95)=263.69ms
    iteration_duration.: avg=1.12s min=1s med=1.07s max=2.34s p(90)=1.27s p(95)=1.34s
    iterations.........: 1044093 115.996928/s
    requests...........: 1044093 115.996928/s
    respons_OK.........: 991524 110.156603/s
    vus................: 29 min=1 max=200
    vus_max ...........: 200 min=200 max=200
    ```


![performace_test_1](https://user-images.githubusercontent.com/49264688/235345966-6a6e835b-9c3e-4413-b1c0-f5c59bed2c65.png)


* vus를 늘렸을 때, 해당 request도 같이 증가 해야 하지만 약 150의 vus 이후로 request 가 늘어나지 않는 것으로 볼 수 있다.
        - 따라서 vus가 150이 임계점이라고 판단 된다.
    - 또한 RPS 는 위의 정보와 같이 RPS = 115이다.
----
    2. 1만개의 쿠폰에서 vues 가 200, 250, 300 인 경우

    ```bash
    checks...............: 99.93% ✓ 13010      ✗ 8
    data_received........: 13 MB  136 kB/s
    data_sent............: 3.9 MB 43 kB/s
    group_duration.......: avg=395.5ms  min=10.98ms med=400.56ms max=1.14s p(90)=698.98ms p(95)=788.6ms
    grpc_req_duration....: avg=197.54ms min=2.12ms  med=16.3ms   max=1.13s p(90)=606.96ms p(95)=691.79ms
    iteration_duration...: avg=1.39s    min=1.01s   med=1.4s     max=2.14s p(90)=1.7s     p(95)=1.79s
    iterations...........: 13018  142.249579/s
    request_per_give.....: 13018  142.249579/s
    response_per_give....: 13010  142.162162/s
    vus..................: 154    min=6        max=299
    vus_max..............: 300    min=300      max=300
    ```


![performance_test_2](https://user-images.githubusercontent.com/49264688/235345975-6b64e509-d7e5-4621-ad41-19920a84c107.png)


----
- 성능 테스트 결과
    - vues 가 150~ 200 정도가 최대이며 그이상일 경우 요청이 더이상 늘어나지 않았다.
        - vueser 의 임계점은 150~200 정도이다.
    - 하나의 서버로 요구사항인 최대 RPS 1500은 맞출 수 없었다.

