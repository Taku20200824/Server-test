Class Test.Barcode.MobileApi Extends %CSP.REST
{

Parameter CONTENTTYPE = "application/json; charset=utf-8";

XData UrlMap
{
<Routes>
    <Route Url="/" Method="GET" Call="Home"/>
    <Route Url="/api/list" Method="GET" Call="List"/>
    <Route Url="/api/search/:barcode" Method="GET" Call="Search"/>
    <Route Url="/api/register" Method="POST" Call="Register"/>
    <Route Url="/api/delete" Method="POST" Call="Delete"/>
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

    Set id = +code

    If '$Data(^Data("NameManager","Records",id)) {
        Set obj.found = 0
        Set obj.barcode = code
        Set obj.no = id
        Set obj.message = "Data not found."
        Write obj.%ToJSON()
        Quit $$$OK
    }

    Do ..WriteRecordJson(id, code)
    Quit $$$OK
}

ClassMethod List() As %Status
{
    Do ..SetJsonHeader()
    Set obj = {}
    Set records = []
    Set id = ""

    For {
        Set id = $Order(^Data("NameManager","Records",id))
        Quit:id=""
        Set node = ^Data("NameManager","Records",id)
        Set row = {}
        Set row.no = id
        Set row.barcode = $Translate($Justify(id,6)," ","0")
        Set row.name = $List(node,1)
        Set row.kanji = $List(node,2)
        Set row.katakana = $List(node,3)
        Set row.address = $List(node,4)
        Set row.addedDateTime = $List(node,5)
        Do records.%Push(row)
    }

    Set obj.count = records.%Size()
    Set obj.records = records
    Write obj.%ToJSON()
    Quit $$$OK
}

ClassMethod Register() As %Status
{
    Do ..SetJsonHeader()

    Set raw = %request.Content.Read()
    Set invalidJson = 0
    Try {
        Set req = {}.%FromJSON(raw)
    } Catch ex {
        Set invalidJson = 1
    }

    If invalidJson {
        Set obj = {}
        Set obj.found = 0
        Set obj.message = "Invalid JSON."
        Write obj.%ToJSON()
        Quit $$$OK
    }

    Set barcode = ..CleanBarcodeValue(req.%Get("barcode",""))
    Set name = req.%Get("name","")
    Set kanji = req.%Get("kanji","")
    Set katakana = req.%Get("katakana","")
    Set address = req.%Get("address","")

    Set obj = {}

    If barcode="" {
        Set obj.found = 0
        Set obj.message = "Barcode is empty."
        Write obj.%ToJSON()
        Quit $$$OK
    }

    If barcode'?1.N {
        Set obj.found = 0
        Set obj.barcode = barcode
        Set obj.message = "Barcode must be numeric."
        Write obj.%ToJSON()
        Quit $$$OK
    }

    If name="" {
        Set obj.found = 0
        Set obj.barcode = barcode
        Set obj.message = "Name is required."
        Write obj.%ToJSON()
        Quit $$$OK
    }

    Set id = +barcode
    Set addedDateTime = $ZDATETIME($HOROLOG,3)
    Set ^Data("NameManager","Records",id) = $ListBuild(name,kanji,katakana,address,addedDateTime)

    Do ..WriteRecordJson(id, barcode, "Registered")
    Quit $$$OK
}

ClassMethod Delete() As %Status
{
    Do ..SetJsonHeader()

    Set raw = %request.Content.Read()
    Set invalidJson = 0
    Try {
        Set req = {}.%FromJSON(raw)
    } Catch ex {
        Set invalidJson = 1
    }

    If invalidJson {
        Set obj = {}
        Set obj.deleted = 0
        Set obj.message = "Invalid JSON."
        Write obj.%ToJSON()
        Quit $$$OK
    }

    Set barcode = ..CleanBarcodeValue(req.%Get("barcode",""))
    Set obj = {}

    If barcode="" {
        Set obj.deleted = 0
        Set obj.message = "Barcode is empty."
        Write obj.%ToJSON()
        Quit $$$OK
    }

    If barcode'?1.N {
        Set obj.deleted = 0
        Set obj.barcode = barcode
        Set obj.message = "Barcode must be numeric."
        Write obj.%ToJSON()
        Quit $$$OK
    }

    Set id = +barcode

    If '$Data(^Data("NameManager","Records",id)) {
        Set obj.deleted = 0
        Set obj.barcode = barcode
        Set obj.no = id
        Set obj.message = "Data not found."
        Write obj.%ToJSON()
        Quit $$$OK
    }

    Kill ^Data("NameManager","Records",id)
    Set obj.deleted = 1
    Set obj.barcode = barcode
    Set obj.no = id
    Set obj.message = "Deleted"
    Write obj.%ToJSON()
    Quit $$$OK
}

ClassMethod WriteRecordJson(id As %Integer, barcode As %String, message As %String = "") As %Status
{
    Set node = ^Data("NameManager","Records",id)
    Set obj = {}
    Set obj.found = 1
    If message'="" {
        Set obj.message = message
    }
    Set obj.no = id
    Set obj.barcode = barcode
    Set obj.name = $List(node,1)
    Set obj.kanji = $List(node,2)
    Set obj.katakana = $List(node,3)
    Set obj.address = $List(node,4)
    Set obj.addedDateTime = $List(node,5)
    Write obj.%ToJSON()
    Quit $$$OK
}

ClassMethod SetHtmlHeader()
{
    Set %response.ContentType = "text/html"
    Set %response.CharSet = "utf-8"
}

ClassMethod Home() As %Status
{
    Do ..SetHtmlHeader()
    Write "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>IRIS Barcode API</title></head><body>"
    Write "<h1>IRIS Barcode API</h1>"
    Write "<p>GET ./api/ping</p>"
    Write "<p>GET ./api/list</p>"
    Write "<p>GET ./api/search/000001</p>"
    Write "<p>POST ./api/register</p>"
    Write "</body></html>"
    Quit $$$OK
}

}
