#API

## API 方法與 url

- GET /animal

  - 獲取全部動物列表
  - 可以進行篩選

    - query 參數:
      - shelter_pkid(可選): 收容所 ID
      - sex(可選): 性別 (M、F、N)
      - age(可選): 年齡 (CHILD、ADULT)
      - bodytype(可選): 體型 （"SMALL"、"MEDIUM"、"BIG"）
      - colour(可選): 毛色 (黃色、虎斑色...)
      - kind(可選): 動物種類（狗、貓、鳥...）
      - variety(可選): 品種（哈士奇、米克斯...）
      - page(可選): 頁碼（預設為 1）
      - ex: ?kind=狗&colour=黃色

  - Response 數據格式：
    - total: 數據總數量
    - page: 當下頁碼
    - limit: 固定十筆
    - totalPages: 總頁碼

  ```
    {
    "data": [
        {
            "id": "1",
            "variety": "威瑪獵犬",
            "kind": "狗",
            "bigint": null,
            "sex": "N",
            "age": "ADULT",
            "bodytype": "SMALL",
            "colour": "黃色",
            "shelter_name": "收容所名稱",
            "shelter_address": "收容所地址",
            "shelter_tel": "收容所電話"
        },
        {
            "id": "2",
            "variety": "威瑪獵犬",
            "kind": "狗",
            "bigint": null,
            "sex": "N",
            "age": "ADULT",
            "bodytype": "SMALL",
            "colour": "黃色",
            "shelter_name": "收容所名稱",
            "shelter_address": "收容所地址",
            "shelter_tel": "收容所電話"
        },
        {
            "id": "3",
            "variety": "混種犬",
            "kind": "狗",
            "bigint": null,
            "sex": "M",
            "age": "ADULT",
            "bodytype": "BIG",
            "colour": "黃色",
            "shelter_name": "收容所名稱",
            "shelter_address": "收容所地址",
            "shelter_tel": "收容所電話"
        }...
    ],
    "pagination": {
        "total": 5554,
        "page": 1,
        "limit": 10,
        "totalPages": 556
    }
  }
  ```

- GET /animal/:id

  - 根據 id 獲取單筆動物資料
  - Response 數據格式：
    ```
    {
      "id": "1",
      "variety": "混種犬",
      "kind": "狗",
      "sex": "M",
      "age": "ADULT",
      "bodytype": "BIG",
      "colour": "黃色",
      "shelter_name": "收容所名稱",
      "shelter_address": "收容所地址",
      "shelter_tel": "收容所電話"
    }
    ```

- POST /animal/create

  - 新增動物資料
  - Response 數據格式：
    ```
    {
      "shelter_pkid": 48,
      "variety": "混種犬",
      "sex": "M",
      "age": "ADULT",
      "bodytype": "BIG",
      "colour": "黑白色"
    }
    ```

- PUT /animal/:id

  - 根據 id 更新單筆動物資料
  - 可以部份更新
  - Request 數據格式：
    ```
    {
      "sex": "F",
      "age": "CHILD"
    }
    ```
  - Request 數據格式：
    ```
    {
        "message": "動物 ID XXXXXX 資料更新成功",
    }
    ```

- DELETE /animal/:id

  - 根據 id 刪除單筆動物資料
  - Request 數據格式：
    ```
    {
      "message": "動物 ID XXXXXX 刪除成功",
    }
    ```

- POST /animal/resource/:id

  - 根據 id 上傳動物的圖片或是影片
  - Request 數據格式：
  - 請使用 `multipart/form-data` 格式，上傳文字及檔案欄位

  | 欄位名稱 | 類型 | 說明                     | 範例                       |
  | -------- | ---- | ------------------------ | -------------------------- |
  | type     | text | 選擇試圖片還是影片的類型 | 1 為圖片，2 為影片         |
  | urls     | text | 圖片或影片網址           | (選擇一張照片或影片的網址) |
  | images   | file | 要上傳的圖片             | (選擇一張照片檔案)         |

- POST /user/register

  - 註冊帳號，讀取名稱、密碼
  - 檢查帳號是否重複，重複拒絕註冊，密碼至少 6 個字元
  - Request 數據格式：
    ```
    {
      "username": "Name",
      "password": "password"
    }
    ```
    - Response 數據格式：
    ```
    {
      "message": "username:Name註冊成功"
    }
    ```

- POST /user/login
  - 檢查密碼是否正確，錯誤拒絕登入。
  - Request 數據格式：
    ```
    {
      "username": "Name",
      "password": "password"
    }
    ```
    - Response 數據格式：
    ```
    {
      "message": "登入成功",
      "token": XXX
    }
    ```
