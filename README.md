## NANYA_web

### Step 1 : install apache
```
sudo apt-get install apache2
```
### step 2
```
git clone https://github.com/alan-chen-lab/NANYA_web.git
```
並移至 /var/www/html下
### 注意事項
```
1. 需先在機器人的終端機(terminal)開啟.go檔，即 cd naya_navigation/src/M03_navigation && go run main.go or go run main_non_camera_ver.go，否則網頁無法與機器人連線
2. 若此時無須開啟人員偵測功能： go run main.go，若需要開啟則： go run main_non_camera_ver.go
3. 機器人重開機時需先將相機USB拔掉，等開機後在插上，以確保機器人能成功讀到正確的相機.
```
## Introduction

### 首頁： index.html

![screen](/Picture_web/首頁.png)

### 操控： control.html

![screen](/Picture_web/操控.png)

### 建圖： Mapping.html

![screen](/Picture_web/建圖1.png)![screen](/Picture_web/建圖2.png)

### 導航： navigation.html

![screen](/Picture_web/導航1.png)![screen](/Picture_web/導航2.png)

### 多點導航： web_multi_goal.html

![screen](/Picture_web/多點導航1.png)
![screen](/Picture_web/多點導航2.png)
