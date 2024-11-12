**순발력 테스트 게임 API 명세서**

---

### 1. 시간 저장 API

- **설명**: 유저가 파리를 모두 잡는 데 걸린 시간을 저장합니다.
- **URL**: `https://port-0-catch-the-fly-back-m3dtig8o219ced49.sel4.cloudtype.app/api/save-time`
- **Method**: POST
- **Headers**: 
  - `Content-Type: application/json`

#### Request Body
```json
{
  "username": "string", // 유저 이름
  "time": "number", // 걸린 시간 (초 단위)
  "difficulty": "string" // 난이도 (easy, medium, hard 중 하나)
}
```

#### Response (성공 시)
- **Status Code**: 201 Created
- **Body**:
  ```json
  {
    "message": "Time saved successfully",
    "data": {
      "username": "string",
      "time": "number",
      "difficulty": "string"
    }
  }
  ```

#### Response (실패 시)
- **Status Code**: 400 Bad Request
- **Body**:
  ```json
  {
    "message": "Invalid input data"
  }
  ```

---

### 2. 랭킹 조회 API

- **설명**: 난이도별 상위 5명의 기록을 불러옵니다.
- **URL**: `https://port-0-catch-the-fly-back-m3dtig8o219ced49.sel4.cloudtype.app/api/rankings`
- **Method**: GET
- **Headers**: 
  - `Content-Type: application/json`

#### Query Parameters
- **difficulty**: string (필수, `easy`, `medium`, `hard` 중 하나)

#### Example Request
```
GET https://port-0-catch-the-fly-back-m3dtig8o219ced49.sel4.cloudtype.app/api/rankings?difficulty=easy
```

#### Response (성공 시)
- **Status Code**: 200 OK
- **Body**:
  ```json
  {
    "difficulty": "string",
    "rankings": [
      {
        "rank": 1,
        "username": "string",
        "time": "number"
      },
      {
        "rank": 2,
        "username": "string",
        "time": "number"
      },
      {
        "rank": 3,
        "username": "string",
        "time": "number"
      },
      {
        "rank": 4,
        "username": "string",
        "time": "number"
      },
      {
        "rank": 5,
        "username": "string",
        "time": "number"
      }
    ]
  }
  ```

#### Response (실패 시)
- **Status Code**: 400 Bad Request
- **Body**:
  ```json
  {
    "message": "Invalid difficulty level"
  }
  ```

---

### 추가 참고사항
- `time` 필드는 **낮을수록** 순위가 높습니다.
- 난이도에 따라 **메모리 내에서 임시 저장된 상위 5명의 기록**을 정렬해 제공합니다.
- 데이터베이스 없이 서버 메모리를 이용하므로 서버 재시작 시 랭킹 데이터가 초기화될 수 있습니다.