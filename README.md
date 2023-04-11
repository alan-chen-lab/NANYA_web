## NAYA_web

### Step 1 : install apache
```
sudo apt-get install apache2
```
### step 2
```
git clone 並移至 /var/www/html下
```
### 注意事項
```
1. 需先在機器人的終端機(terminal)開啟.go檔，即 cd naya_navigation/src/M03_navigation && go run main.go or go run main_non_camera_ver.go，否則網頁無法與機器人連線
2. 若此時無須開啟人員偵測功能： go run main.go，若需要開啟則： go run main_non_camera_ver.go
3. 機器人重開機時需先將相機USB拔掉，等開機後在插上，以確保機器人能成功讀到正確的相機.
```
