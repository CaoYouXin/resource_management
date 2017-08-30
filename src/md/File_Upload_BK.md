

我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

文件上传在服务器端，主要是对请求体的解析，会用到`编译原理`里讲到的`自动机`。

首先，要读取一个特殊的`Header`
---

```
Content-Type:multipart/form-data; boundary=ZnGpDtePMx0KrHh_G0X99Yef9r8JZsRJSXC
```

文件上传的`Content-Type`必须是`multipart/form-data`，且提供`boundary`。`boundary`指示各`part`的边界，以及最后请求的的结束（是`boundary`后跟`--`结束）。

以上，自动的状态大致包括如下几类
---

* 边界
* 普通`part`（即Header）
* 文件内容`part`

```
switch (this.state) {
    case START:
        this.index = 2;
        this.state = BOUNDARY;
    case BOUNDARY:
        if (this.boundaryEndFlag) {
            this.boundaryEndFlag = false;
            if (read == LF) {
                this.index = 0;
                this.state = HEADER_NAME;
                break;
            } else {
                throw new RuntimeException("request parse error, near header, expect LF but get [" + read + "].");
            }
        }

        if (this.index < this.boundary.length) {
            if (this.boundary[this.index] != read) {
                throw new RuntimeException("request parse error, near boundary. expect "
                        + this.boundary[this.index] + " , but get " + read + " ");
            }
            this.index++;
        } else if (read == CR) {
            this.handler.onNewPart();
            this.boundaryEndFlag = true;
        } else {
            throw new RuntimeException("request parse error, near boundary.");
        }
        break;
    case HEADER_NAME:
        if (this.headerEndFlag) {
            this.headerEndFlag = false;
            if (read == LF) {
                this.index = 0;
                this.state = PART_DATA;
                break;
            } else {
                throw new RuntimeException("request parse error, near header, expect LF but get [" + read + "].");
            }
        }

        if (this.headerNameEndFlag) {
            this.headerNameEndFlag = false;
            if (read == SPACE) {
                this.state = HEADER_VALUE;
                break;
            } else {
                throw new RuntimeException("request parse error, near header, expect SPACE but get [" + read + "].");
            }
        }

        if (read == CR) {
            File file = this.handler.onHeaderEnd();
            if (null != file) {
                this.bufferedOutputStream = new BufferedOutputStream(new FileOutputStream(file));
            }
            this.headerEndFlag = true;
        } else if (read == COLON) {
!            this.handler.onHeaderName(this.byteBuffer.flush());
            this.headerNameEndFlag = true;
        } else {
!            this.byteBuffer.append(read);
        }
        break;
    case HEADER_VALUE:
        if (this.headerValueEndFlag) {
            this.headerValueEndFlag = false;
            if (read == LF) {
                this.state = HEADER_NAME;
                break;
            } else {
                throw new RuntimeException("request parse error, near header, expect LF but get [" + read + "].");
            }
        }

        if (read == CR) {
!            this.handler.onHeaderValue(this.byteBuffer.flush());
            this.headerValueEndFlag = true;
        } else {
!            this.byteBuffer.append(read);
        }
        break;
    case PART_DATA:
        if (this.partDataEndFlag) {
            this.partDataEndFlag = false;
            if (read == LF) {
                this.index = 0;
                this.state = HEADER_NAME;
                break;
            } else {
                throw new RuntimeException("request parse error, near header, expect LF but get [" + read + "].");
            }
        }

        if (this.allEndFlag) {
            this.allEndFlag = false;
            if (read == HYPHEN) {
                this.state = END;
                break;
            } else {
                throw new RuntimeException("request parse error, near header, expect HYPHEN but get [" + read + "].");
            }
        }

        if (this.index < this.boundary.length) {
            if (this.boundary[this.index] == read) {
!                this.byteBuffer.append(read);
                this.index++;
            } else {
                if (this.index > 0) {
                    if (null != this.bufferedOutputStream) {
!                        this.bufferedOutputStream.write(this.byteBuffer.flush());
                    } else {
!                        this.partDataBuffer.append(this.byteBuffer.flush());
                    }
                    this.index = 0;
                    this.processRead(read);
                } else {
                    if (null != this.bufferedOutputStream) {
                        this.bufferedOutputStream.write(read);
                    } else {
!                        this.partDataBuffer.append(read);
                    }
                }
            }
        } else if (this.index == this.boundary.length) {
            if (read == CR) {
                this.handler.onNewPart();
                this.partDataEndFlag = true;
            } else if (read == HYPHEN) {
                this.allEndFlag = true;
            }

            if (read == CR || read == HYPHEN) {
!                this.byteBuffer.flush();
                if (null != this.bufferedOutputStream) {
                    this.bufferedOutputStream.flush();
                    this.bufferedOutputStream.close();
                    this.bufferedOutputStream = null;
                } else {
!                    this.handler.onPartData(this.partDataBuffer.flush());
                }
            }
        }
        break;
    case END:
        break;
    default:
        break;
}
```

自动机是一个字节一个字节的处理的，所以其中使用到了两个`buffer`，分别是装普通内容的`buffer`和装文件内容的`buffer`。

结束语
---

内容虽然在网上已经铺天盖地了，但是确实对Serve 1.0的一个总结和记录，并且沿用到Serve 2.0。