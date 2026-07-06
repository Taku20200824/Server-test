Class Demo.Screen.UserSearch Extends %CSP.Page
{

ClassMethod OnPage() As %Status
{
    &html<
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>User Search</title>
        <style>
            body {
                font-family: Arial;
                padding: 30px;
            }
            input {
                padding: 8px;
                width: 200px;
            }
            button {
                padding: 8px 16px;
            }
            .box {
                margin-top: 20px;
                padding: 15px;
                border: 1px solid #ccc;
                width: 400px;
            }
        </style>
    </head>
    <body>
        <h1>ユーザー検索</h1>

        <form method="post">
            <label>ユーザーID：</label>
            <input type="text" name="userId">
            <button type="submit">検索</button>
        </form>
    >

    Set userId = %request.Get("userId")

    If userId '= "" {
        Do ..SearchUser(userId)
    }

    &html<
    </body>
    </html>
    >

    Quit $$$OK
}

ClassMethod SearchUser(userId As %String)
{
    // Жишээ data
    If userId = "001" {
        Set userName = "Togu"
        Set email = "togu@example.com"
    } Else {
        Set userName = ""
        Set email = ""
    }

    If userName '= "" {
        &html<
        <div class="box">
            <h2>検索結果</h2>
        >
        Write "<p>ユーザーID: "_userId_"</p>"
        Write "<p>名前: "_userName_"</p>"
        Write "<p>メール: "_email_"</p>"
        &html<
        </div>
        >
    } Else {
        &html<
        <div class="box">
            <p>データが見つかりません。</p>
        </div>
        >
    }
}

}