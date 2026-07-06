Class Test.Barcode.MobileApi Extends %CSP.REST
{

Parameter CONTENTTYPE = "application/json; charset=utf-8";

XData UrlMap
{
<Routes>
    <Route Url="/" Method="GET" Call="Home"/>
    <Route Url="/api/search/:barcode" Method="GET" Call="Search"/>
    <Route Url="/api/ping" Method="GET" Call="Ping"/>
    <Route Url="/api/:dummy" Method="OPTIONS" Call="Options"/>
</Routes>
}
ClassMethod SetJsonHeader()
{
    Do %response.SetHeader("Access-Control-Allow-Origin","*")
    Do %response.SetHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS")
    Do %response.SetHeader("Access-Control-Allow-Headers","Content-Type")
    Set %response.ContentType = "application/json"
    Set %response.CharSet = "utf-8"
}
ClassMethod SetCors()
{
    Do %response.SetHeader("Access-Control-Allow-Origin","*")
    Do %response.SetHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS")
    Do %response.SetHeader("Access-Control-Allow-Headers","Content-Type")
}

ClassMethod Options(dummy As %String = "") As %Status
{
    Do ..SetCors()
    Set %response.Status = "204 No Content"
    Quit $$$OK
}

ClassMethod CleanBarcodeValue(pBarcode As %String) As %String
{
    Set code = pBarcode
    Set code = $ZStrip(code,"<>W")
    Set code = $Replace(code,"*","")
    Set code = $ZCONVERT(code,"U")
    Quit code
}

ClassMethod Ping() As %Status
{
    Do ..SetJsonHeader()

    Set obj = {}
    Set obj.ok = 1
    Set obj.message = "IRIS Barcode API is working."

    Write obj.%ToJSON()
    Quit $$$OK
}
ClassMethod SetHtmlHeader()
{
    Set %response.ContentType = "text/html"
    Set %response.CharSet = "utf-8"
}

ClassMethod Search(barcode As %String) As %Status
{

    Do ..SetJsonHeader()

    Set code = ..CleanBarcodeValue(barcode)

    Set obj = {}

    If code="" {
        Set obj.found = 0
        Set obj.message = "Barcode is empty."
        Write obj.%ToJSON()
        Quit $$$OK
    }

    If code'?1.N {
        Set obj.found = 0
        Set obj.barcode = code
        Set obj.message = "Barcode must be numeric."
        Write obj.%ToJSON()
        Quit $$$OK
    }

    // 000001 -> 1
    Set id = +code

    If '$Data(^Data("NameManager","Records",id)) {
        Set obj.found = 0
        Set obj.barcode = code
        Set obj.no = id
        Set obj.message = "Data not found."
        Write obj.%ToJSON()
        Quit $$$OK
    }

    Set node = ^Data("NameManager","Records",id)

    Set obj.found = 1
    Set obj.no = id
    Set obj.barcode = code
    Set obj.name = $List(node,1)
    Set obj.kanji = $List(node,2)
    Set obj.katakana = $List(node,3)
    Set obj.address = $List(node,4)
    Set obj.addedDateTime = $List(node,5)

    Write obj.%ToJSON()
    Quit $$$OK
}

ClassMethod Home() As %Status
{
    Do ..SetHtmlHeader()

    Write "<!DOCTYPE html>",!
    Write "<html lang='ja'>",!
    Write "<head>",!
    Write "<meta charset='UTF-8'>",!
    Write "<meta name='viewport' content='width=device-width, initial-scale=1.0'>",!
    Write "<title>IRIS Barcode Search</title>",!
    Write "<script src='https://unpkg.com/html5-qrcode'></script>",!
    Write "<style>",!
    Write "body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:16px;}",!
    Write ".card{background:white;border-radius:14px;padding:16px;margin-bottom:16px;box-shadow:0 2px 10px #0002;}",!
    Write "h1{font-size:22px;margin:0 0 12px;}",!
    Write "button{width:100%;padding:14px;border:0;border-radius:10px;font-size:16px;margin-top:8px;}",!
    Write ".start{background:#111;color:white;}",!
    Write ".stop{background:#888;color:white;}",!
    Write "input{width:100%;padding:12px;font-size:18px;border:1px solid #ccc;border-radius:10px;box-sizing:border-box;}",!
    Write "#reader{width:100%;max-width:420px;margin:auto;}",!
    Write ".row{padding:8px 0;border-bottom:1px solid #eee;}",!
    Write ".label{font-size:13px;color:#666;}",!
    Write ".value{font-size:19px;font-weight:bold;word-break:break-all;}",!
    Write ".ok{color:#0a7d26;font-weight:bold;}",!
    Write ".ng{color:#c62828;font-weight:bold;}",!
    Write "</style>",!
    Write "</head>",!
    Write "<body>",!

    Write "<div class='card'>",!
    Write "<h1>IRIS Barcode Search</h1>",!
    Write "<div id='status'>Ready</div>",!
    Write "</div>",!

    Write "<div class='card'>",!
    Write "<div id='reader'></div>",!
    Write "<button class='start' onclick='startScan()'>Start Camera Scan</button>",!
    Write "<button class='stop' onclick='stopScan()'>Stop Camera</button>",!
    Write "</div>",!

    Write "<div class='card'>",!
    Write "<div class='label'>Manual Barcode</div>",!
    Write "<input id='manual' placeholder='000001'>",!
    Write "<button class='start' onclick='manualSearch()'>Search</button>",!
    Write "</div>",!

    Write "<div class='card' id='result'>",!
    Write "<div class='label'>Result</div>",!
    Write "<div class='value'>No data</div>",!
    Write "</div>",!

    Write "<script>",!
    Write "let html5QrCode=null;",!
    Write "let scanning=false;",!

    Write "function cleanCode(code){return String(code||'').replaceAll('*','').trim();}",!

    Write "async function searchBarcode(code){",!
    Write "  code=cleanCode(code);",!
    Write "  if(!code){return;}",!
    Write "  document.getElementById('status').innerHTML='Searching: '+code;",!
    Write "  try{",!
    Write "    const res=await fetch('./api/search/'+encodeURIComponent(code));",!
    Write "    const data=await res.json();",!
    Write "    showResult(data);",!
    Write "  }catch(e){",!
    Write "    document.getElementById('result').innerHTML='<div class=""ng"">API error</div><div>'+e+'</div>'; ",!
    Write "  }",!
    Write "}",!

    Write "function showResult(data){",!
    Write "  if(!data.found){",!
    Write "    document.getElementById('result').innerHTML='<div class=""ng"">Not Found</div><div>'+JSON.stringify(data)+'</div>'; ",!
    Write "    document.getElementById('status').innerHTML='Not found';",!
    Write "    return;",!
    Write "  }",!
    Write "  document.getElementById('status').innerHTML='<span class=""ok"">Found</span>: '+data.barcode;",!
    Write "  document.getElementById('result').innerHTML=''",!
    Write "  + '<div class=""row""><div class=""label"">No</div><div class=""value"">'+data.no+'</div></div>'",!
    Write "  + '<div class=""row""><div class=""label"">Barcode</div><div class=""value"">'+data.barcode+'</div></div>'",!
    Write "  + '<div class=""row""><div class=""label"">Name</div><div class=""value"">'+data.name+'</div></div>'",!
    Write "  + '<div class=""row""><div class=""label"">Kanji</div><div class=""value"">'+data.kanji+'</div></div>'",!
    Write "  + '<div class=""row""><div class=""label"">Katakana</div><div class=""value"">'+data.katakana+'</div></div>'",!
    Write "  + '<div class=""row""><div class=""label"">Address</div><div class=""value"">'+data.address+'</div></div>'",!
    Write "  + '<div class=""row""><div class=""label"">Added DateTime</div><div class=""value"">'+data.addedDateTime+'</div></div>'; ",!
    Write "}",!

    Write "function manualSearch(){",!
    Write "  searchBarcode(document.getElementById('manual').value);",!
    Write "}",!

    Write "async function startScan(){",!
    Write "  if(scanning){return;}",!
    Write "  html5QrCode=new Html5Qrcode('reader');",!
    Write "  const config={fps:10,qrbox:{width:280,height:160},formatsToSupport:[Html5QrcodeSupportedFormats.CODE_39,Html5QrcodeSupportedFormats.CODE_128]};",!
    Write "  try{",!
    Write "    await html5QrCode.start({facingMode:'environment'},config,(decodedText)=>{",!
    Write "      document.getElementById('manual').value=cleanCode(decodedText);",!
    Write "      searchBarcode(decodedText);",!
    Write "    });",!
    Write "    scanning=true;",!
    Write "    document.getElementById('status').innerHTML='Camera started';",!
    Write "  }catch(e){",!
    Write "    document.getElementById('status').innerHTML='<span class=""ng"">Camera error</span>: '+e;",!
    Write "  }",!
    Write "}",!

    Write "async function stopScan(){",!
    Write "  if(html5QrCode && scanning){",!
    Write "    await html5QrCode.stop();",!
    Write "    scanning=false;",!
    Write "    document.getElementById('status').innerHTML='Camera stopped';",!
    Write "  }",!
    Write "}",!
    Write "</script>",!

    Write "</body>",!
    Write "</html>",!

    Quit $$$OK
}

}