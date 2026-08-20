Class Test.Test Extends %RegisteredObject
{

Property CurrentUser As %String;

Parameter Root = "NameManager";

//////////////////////////////////////////////
// UI
//////////////////////////////////////////////

Method ScreenWidth() As %Integer
{
    Quit 100
}

Method MenuWidth() As %Integer
{
    Quit 72
}

Method RepeatChar(pChar As %String, pCount As %Integer) As %String
{
    Set out = ""
    For i=1:1:pCount {
        Set out = out_pChar
    }
    Quit out
}

Method Spaces(pCount As %Integer) As %String
{
    If pCount<=0 {
        Quit ""
    }
    Quit ..RepeatChar(" ",pCount)
}

Method PadRight(pText As %String, pWidth As %Integer) As %String
{
    Quit $Extract(pText_..Spaces(pWidth),1,pWidth)
}


Method CharDisplayWidth(pChar As %String) As %Integer
{
    // ASCII and half-width Katakana are width 1.
    // Kanji / full-width Japanese characters are width 2 in terminal.
    If pChar="" {
        Quit 0
    }

    If $ASCII(pChar)<256 {
        Quit 1
    }

    If pChar?1.ZHWKATAZ {
        Quit 1
    }

    Quit 2
}

Method DisplayWidth(pText As %String) As %Integer
{
    Set width = 0
    For i=1:1:$Length(pText) {
        Set width = width + ..CharDisplayWidth($Extract(pText,i))
    }
    Quit width
}

Method FitCell(pText As %String, pWidth As %Integer) As %String
{
    Set out = ""
    Set width = 0

    For i=1:1:$Length(pText) {
        Set ch = $Extract(pText,i)
        Set cw = ..CharDisplayWidth(ch)
        Quit:(width+cw)>pWidth
        Set out = out_ch
        Set width = width + cw
    }

    Quit out_..Spaces(pWidth-width)
}

Method CenterText(pText As %String, pWidth As %Integer) As %String
{
    Set len = $Length(pText)
    If len>=pWidth {
        Quit $Extract(pText,1,pWidth)
    }

    Set left = (pWidth-len)\2
    Set right = pWidth-len-left
    Quit ..Spaces(left)_pText_..Spaces(right)
}

Method LeftPad(pWidth As %Integer) As %Integer
{
    If ..ScreenWidth()<=pWidth {
        Quit 0
    }
    Quit (..ScreenWidth()-pWidth)\2
}

Method WriteBlockLine(pText As %String = "", pWidth As %Integer = 0)
{
    If pWidth=0 {
        Set pWidth = ..MenuWidth()
    }
    Write ..Spaces(..LeftPad(pWidth)),..PadRight(pText,pWidth),!
}

Method WriteCenteredLine(pText As %String = "", pWidth As %Integer = 0)
{
    If pWidth=0 {
        Set pWidth = ..MenuWidth()
    }
    Write ..Spaces(..LeftPad(pWidth)),..CenterText(pText,pWidth),!
}

Method DrawBorder(pWidth As %Integer = 0)
{
    If pWidth=0 {
        Set pWidth = ..MenuWidth()
    }
    Do ..WriteBlockLine(..RepeatChar("=",pWidth),pWidth)
}

Method DrawSubBorder(pWidth As %Integer = 0)
{
    If pWidth=0 {
        Set pWidth = ..MenuWidth()
    }
    Do ..WriteBlockLine(..RepeatChar("-",pWidth),pWidth)
}

Method DrawHeader(pTitle As %String, pWidth As %Integer = 0)
{
    If pWidth=0 {
        Set pWidth = ..MenuWidth()
    }
    Do ..DrawBorder(pWidth)
    Do ..WriteCenteredLine(pTitle,pWidth)
    Do ..DrawSubBorder(pWidth)
}

Method WriteMenuItem(pNo As %Integer, pLabel As %String, pRole As %String = "", pWidth As %Integer = 0)
{
    If pWidth=0 {
        Set pWidth = ..MenuWidth()
    }

    Set left = pNo_". "_pLabel

    If pRole="" {
        Set line = left
    } Else {
        Set right = "["_pRole_"]"
        Set gap = pWidth-$Length(left)-$Length(right)
        If gap<1 {
            Set gap = 1
        }
        Set line = left_..Spaces(gap)_right
    }

    Do ..WriteBlockLine(line,pWidth)
}

Method WriteInfoLine(pLabel As %String, pValue As %String, pWidth As %Integer = 0)
{
    If pWidth=0 {
        Set pWidth = ..MenuWidth()
    }
    Do ..WriteBlockLine(pLabel_": "_pValue,pWidth)
}

Method ClearScreen()
{
    Write #
}

Method Pause()
{
    Write !
    Write ..Spaces(..LeftPad(..MenuWidth())),"Press Enter to continue..."
    Read x
}

//////////////////////////////////////////////
// COMMON
//////////////////////////////////////////////

Method Upper(pText As %String) As %String
{
    Quit $ZCONVERT(pText,"U")
}

Method CsvEscape(pText As %String) As %String
{
    Set t = pText
    Set t = $Replace(t,$Char(34),$Char(34,34))
    Quit $Char(34)_t_$Char(34)
}

Method CsvUnquote(pText As %String) As %String
{
    Set t = pText

    If $Extract(t,1)=$Char(34) {
        Set t = $Extract(t,2,*)
    }

    If $Extract(t,*)=$Char(34) {
        Set t = $Extract(t,1,*-1)
    }

    Set t = $Replace(t,$Char(34,34),$Char(34))
    Quit t
}

Method HtmlEscape(pText As %String) As %String
{
    Set t = pText
    Set t = $Replace(t,"&","&amp;")
    Set t = $Replace(t,"<","&lt;")
    Set t = $Replace(t,">","&gt;")
    Set t = $Replace(t,$Char(34),"&quot;")
    Quit t
}

Method Pad2(pNum As %Integer) As %String
{
    If +pNum<10 {
        Quit "0"_+pNum
    }
    Quit +pNum
}

Method Pad6(pNum As %Integer) As %String
{
    Quit $Translate($Justify(+pNum,6)," ","0")
}

Method GetNowStamp() As %String
{
    Set h = $Piece($H,",",2)
    Set hh = h\3600
    Set mm = (h#3600)\60
    Set ss = h#60
    Quit $ZDate($H,3)_" "_..Pad2(hh)_":"_..Pad2(mm)_":"_..Pad2(ss)
}

Method NormalizeDateTime(pDateTime As %String) As %String
{
    Set dt = $ZStrip(pDateTime,"<>W")

    If dt="" {
        Quit ..GetNowStamp()
    }

    If dt?4N1"-"2N1"-"2N1" "2N1":"2N1":"2N {
        Quit dt
    }

    If dt?4N1"-"2N1"-"2N1" "2N1":"2N {
        Quit dt_":00"
    }

    If dt?1.2N1"/"1.2N1"/"4N1" "1.2N1":"1.2N {
        Set m = $Piece(dt,"/",1)
        Set rest = $Piece(dt,"/",2,99)
        Set d = $Piece(rest,"/",1)
        Set rest2 = $Piece(rest,"/",2,99)
        Set y = $Piece(rest2," ",1)
        Set tm = $Piece(rest2," ",2,99)
        Set hh = $Piece(tm,":",1)
        Set mi = $Piece(tm,":",2)
        Quit y_"-"_..Pad2(m)_"-"_..Pad2(d)_" "_..Pad2(hh)_":"_..Pad2(mi)_":00"
    }

    If dt?1.2N1"/"1.2N1"/"4N1" "1.2N1":"1.2N1":"1.2N {
        Set m = $Piece(dt,"/",1)
        Set rest = $Piece(dt,"/",2,99)
        Set d = $Piece(rest,"/",1)
        Set rest2 = $Piece(rest,"/",2,99)
        Set y = $Piece(rest2," ",1)
        Set tm = $Piece(rest2," ",2,99)
        Set hh = $Piece(tm,":",1)
        Set mi = $Piece(tm,":",2)
        Set ss = $Piece(tm,":",3)
        Quit y_"-"_..Pad2(m)_"-"_..Pad2(d)_" "_..Pad2(hh)_":"_..Pad2(mi)_":"_..Pad2(ss)
    }

    Quit dt
}

//////////////////////////////////////////////
// PATHS
//////////////////////////////////////////////

Method BasePath() As %String
{
    Quit "C:\0424test\company"
}

Method UserFilePath() As %String
{
    Quit ..BasePath()_"\users.txt"
}

Method NameFilePath() As %String
{
    Quit ..BasePath()_"\names.txt"
}

Method CsvFilePath() As %String
{
    Quit ..BasePath()_"\names.csv"
}

Method ExcelFilePath() As %String
{
    Quit ..BasePath()_"\names_barcode.xls"
}

//////////////////////////////////////////////
// GLOBAL DB : ^Data
//////////////////////////////////////////////

Method DbRoot() As %String
{
    Quit ..#Root
}

Method DbInit()
{
    If '$Data(^Data(..DbRoot(),"LastId")) {
        Set ^Data(..DbRoot(),"LastId") = 0
    }
}

Method DbNextId() As %Integer
{
    Do ..DbInit()

    For {
        Set id = $Increment(^Data(..DbRoot(),"LastId"))
        If '$Data(^Data(..DbRoot(),"Records",id)) {
            Quit
        }
    }

    Quit id
}

Method DbCount() As %Integer
{
    Set cnt = 0
    Set id = 0
    For {
        Set id = $Order(^Data(..DbRoot(),"Records",id))
        If id="" {
            Quit
        }
        Set cnt = cnt + 1
    }
    Quit cnt
}

Method DbRecordExistsByName(pName As %String, pExceptId As %Integer = 0) As %Boolean
{
    Set id = 0
    For {
        Set id = $Order(^Data(..DbRoot(),"Records",id))
        If id="" {
            Quit
        }

        If id'=pExceptId {
            Set item = ^Data(..DbRoot(),"Records",id)
            If $ListGet(item,1)=pName {
                Quit
            }
        }
    }

    Quit 0
}

Method DbGetRecord(pId As %Integer) As %String
{
    If '$Data(^Data(..DbRoot(),"Records",pId)) {
        Quit ""
    }
    Quit ^Data(..DbRoot(),"Records",pId)
}

Method DbFindIdByBarcode(pBarcode As %String) As %Integer
{
    Set code = ..CleanBarcodeValue(pBarcode)
    Set id = 0

    For {
        Set id = $Order(^Data(..DbRoot(),"Records",id))
        If id="" {
            Quit
        }

        If code=..CleanBarcodeValue(..MakeBarcodeValue(id)) {
            Quit
        }
    }

    Quit 0
}

Method DbSaveRecord(pId As %Integer, pName As %String, pKanji As %String, pKatakana As %String, pAddress As %String, pDateTime As %String)
{
    Set pDateTime = ..NormalizeDateTime(pDateTime)
    Set ^Data(..DbRoot(),"Records",pId) = $ListBuild(pName,pKanji,pKatakana,pAddress,pDateTime)
    Set ^Data(..DbRoot(),"NameIndex",pName) = pId

    If pId>+$Get(^Data(..DbRoot(),"LastId")) {
        Set ^Data(..DbRoot(),"LastId") = pId
    }
}

Method DbAddRecord(pName As %String, pKanji As %String, pKatakana As %String, pAddress As %String, pDateTime As %String = "") As %Boolean
{
    If '..ValidateRecord(pName,pKanji,pKatakana,pAddress,0) {
        Quit 0
    }

    Set id = ..DbNextId()
    Do ..DbSaveRecord(id,pName,pKanji,pKatakana,pAddress,pDateTime)
    Quit 1
}

Method DbUpdateRecord(pId As %Integer, pName As %String, pKanji As %String, pKatakana As %String, pAddress As %String) As %Boolean
{
    Set old = ..DbGetRecord(pId)
    If old="" {
        Do ..WriteCenteredLine("Invalid number.",..MenuWidth())
        Quit 0
    }

    If '..ValidateRecord(pName,pKanji,pKatakana,pAddress,pId) {
        Quit 0
    }

    Set oldName = $ListGet(old,1)
    Set oldDate = $ListGet(old,5)

    If oldName'=pName {
        Kill ^Data(..DbRoot(),"NameIndex",oldName)
    }

    Do ..DbSaveRecord(pId,pName,pKanji,pKatakana,pAddress,oldDate)
    Quit 1
}

Method DbDeleteRecord(pId As %Integer) As %Boolean
{
    Set item = ..DbGetRecord(pId)
    If item="" {
        Do ..WriteCenteredLine("Invalid number.",..MenuWidth())
        Quit 0
    }

    Kill ^Data(..DbRoot(),"NameIndex",$ListGet(item,1))
    Kill ^Data(..DbRoot(),"Records",pId)
    Quit 1
}

//////////////////////////////////////////////
// AUTH
//////////////////////////////////////////////

Method IsAdmin() As %Boolean
{
    If ..CurrentUser="" {
        Quit 0
    }
    Quit $Extract(..CurrentUser,$Length(..CurrentUser))="9"
}

Method CheckAdmin() As %Boolean
{
    If '..IsAdmin() {
        Do ..WriteCenteredLine("Only admin can use this function.",..MenuWidth())
        Do ..Pause()
        Quit 0
    }
    Quit 1
}

Method IsValidUserId(pUserId As %String) As %Boolean
{
    Quit ($Length(pUserId)=4)&&(pUserId?4N)
}

Method UserExists(pUserId As %String) As %Boolean
{
    Set found = 0
    Set file = ##class(%Stream.FileCharacter).%New()
    Set file.Filename = ..UserFilePath()

    Set sc = file.LinkToFile(..UserFilePath())
    If $SYSTEM.Status.IsError(sc) {
        Quit 0
    }

    While 'file.AtEnd {
        Set line = file.ReadLine()
        If line'="" {
            If $Piece(line,",",1)=pUserId {
                Set found = 1
                Quit
            }
        }
    }

    Do file.%Close()
    Quit found
}

Method RegisterUser() As %Boolean
{
    Do ..ClearScreen()
    Do ..DrawHeader("REGISTER",..MenuWidth())

    Set pad = ..LeftPad(..MenuWidth())
    Do ..WriteBlockLine("New ID (4 digits)",..MenuWidth())
    Write ..Spaces(pad),">> "
    Read newId

    If newId="" {
        Do ..WriteCenteredLine("ID cannot be empty.",..MenuWidth())
        Do ..Pause()
        Quit 0
    }

    If '..IsValidUserId(newId) {
        Do ..WriteCenteredLine("ID must be exactly 4 digits.",..MenuWidth())
        Do ..Pause()
        Quit 0
    }

    If ..UserExists(newId) {
        Do ..WriteCenteredLine("This ID already exists.",..MenuWidth())
        Do ..Pause()
        Quit 0
    }

    Write !
    Do ..WriteBlockLine("New Password",..MenuWidth())
    Write ..Spaces(pad),">> "
    Read newPass

    If newPass="" {
        Do ..WriteCenteredLine("Password cannot be empty.",..MenuWidth())
        Do ..Pause()
        Quit 0
    }

    Set file = ##class(%Stream.FileCharacter).%New()
    Set file.Filename = ..UserFilePath()

    Set sc = file.LinkToFile(..UserFilePath())
    If $SYSTEM.Status.IsError(sc) {
        Do ..WriteCenteredLine("Cannot open user file.",..MenuWidth())
        Do ..Pause()
        Quit 0
    }

    Do file.MoveToEnd()
    Do file.WriteLine(newId_","_newPass)
    Do file.%Save()
    Do file.%Close()

    Do ..WriteCenteredLine("Register success.",..MenuWidth())
    If $Extract(newId,$Length(newId))="9" {
        Do ..WriteCenteredLine("Role : ADMIN",..MenuWidth())
    } Else {
        Do ..WriteCenteredLine("Role : USER",..MenuWidth())
    }

    Do ..Pause()
    Quit 1
}

Method CheckLogin() As %Boolean
{
    Set found = 0

    Do ..ClearScreen()
    Do ..DrawHeader("LOGIN",..MenuWidth())

    Set pad = ..LeftPad(..MenuWidth())

    Do ..WriteBlockLine("ID",..MenuWidth())
    Write ..Spaces(pad),">> "
    Read userId

    Write !
    Do ..WriteBlockLine("Password",..MenuWidth())
    Write ..Spaces(pad),">> "
    Read password

    Set file = ##class(%Stream.FileCharacter).%New()
    Set file.Filename = ..UserFilePath()

    Set sc = file.LinkToFile(..UserFilePath())
    If $SYSTEM.Status.IsError(sc) {
        Do ..WriteCenteredLine("User file not found.",..MenuWidth())
        Do ..Pause()
        Quit 0
    }

    While 'file.AtEnd {
        Set line = file.ReadLine()
        If line'="" {
            If ($Piece(line,",",1)=userId)&&($Piece(line,",",2,99)=password) {
                Set found = 1
                Set ..CurrentUser = userId
                Quit
            }
        }
    }

    Do file.%Close()

    If found {
        Do ..WriteCenteredLine("Login success.",..MenuWidth())
        If ..IsAdmin() {
            Do ..WriteCenteredLine("Role : ADMIN",..MenuWidth())
        } Else {
            Do ..WriteCenteredLine("Role : USER",..MenuWidth())
        }
        Do ..Pause()
        Quit 1
    }

    Do ..WriteCenteredLine("Invalid ID or Password.",..MenuWidth())
    Do ..Pause()
    Quit 0
}

//////////////////////////////////////////////
// VALIDATION
//////////////////////////////////////////////

Method IsValidKanji(pText As %String) As %Boolean
{
    Quit (pText'="")&&(pText?1.ZFWCHARZ)
}

Method IsValidKatakana(pText As %String) As %Boolean
{
    Quit (pText'="")&&(pText?1.ZHWKATAZ)
}

Method IsValidAddress(pText As %String) As %Boolean
{
    Quit (pText'="")&&(pText?1.ZFWCHARZ)
}

Method ValidateRecord(pName As %String, pKanji As %String, pKatakana As %String, pAddress As %String, pExceptId As %Integer = 0) As %Boolean
{
    If pName="" {
        Do ..WriteCenteredLine("Name cannot be empty.",..MenuWidth())
        Quit 0
    }

    If pKanji="" {
        Do ..WriteCenteredLine("Kanji cannot be empty.",..MenuWidth())
        Quit 0
    }

    If '..IsValidKanji(pKanji) {
        Do ..WriteCenteredLine("Kanji must match ZFWCHARZ.",..MenuWidth())
        Quit 0
    }

    If pKatakana="" {
        Do ..WriteCenteredLine("Katakana cannot be empty.",..MenuWidth())
        Quit 0
    }

    If '..IsValidKatakana(pKatakana) {
        Do ..WriteCenteredLine("Katakana must match ZHWKATAZ.",..MenuWidth())
        Quit 0
    }

    If pAddress="" {
        Do ..WriteCenteredLine("Address cannot be empty.",..MenuWidth())
        Quit 0
    }

    If '..IsValidAddress(pAddress) {
        Do ..WriteCenteredLine("Address must match ZFWCHARZ.",..MenuWidth())
        Quit 0
    }

    If ..DbRecordExistsByName(pName,pExceptId) {
        Do ..WriteCenteredLine("Duplicate name: "_pName,..MenuWidth())
        Quit 0
    }

    Quit 1
}

//////////////////////////////////////////////
// RECORD INPUT / DISPLAY
//////////////////////////////////////////////

Method ReadRequiredField(pLabel As %String, pOldValue As %String = "", pKind As %String = "") As %String
{
    Set pad = ..LeftPad(..MenuWidth())

    For {
        If pOldValue="" {
            Write ..Spaces(pad),pLabel," >> "
        } Else {
            Write ..Spaces(pad),pLabel," [",pOldValue,"] >> "
        }

        Read value

        If (value="")&&(pOldValue'="") {
            Set value = pOldValue
        }

        If value="" {
            Do ..WriteCenteredLine(pLabel_" cannot be empty.",..MenuWidth())
            Continue
        }

        If (pKind="KANJI")&&('..IsValidKanji(value)) {
            Do ..WriteCenteredLine(pLabel_" must match ZFWCHARZ.",..MenuWidth())
            Continue
        }

        If (pKind="KATAKANA")&&('..IsValidKatakana(value)) {
            Do ..WriteCenteredLine(pLabel_" must match ZHWKATAZ.",..MenuWidth())
            Continue
        }

        If (pKind="ADDRESS")&&('..IsValidAddress(value)) {
            Do ..WriteCenteredLine(pLabel_" must match ZFWCHARZ.",..MenuWidth())
            Continue
        }

        Quit
    }

    Quit value
}

Method AddNamesInteractive()
{
    If '..CheckAdmin() {
        Quit
    }

    Do ..ClearScreen()
    Do ..DrawHeader("ADD RECORD",..MenuWidth())

    For {
        Set name = ..ReadRequiredField("Name")
        If ..DbRecordExistsByName(name) {
            Do ..WriteCenteredLine("Duplicate name: "_name,..MenuWidth())
            Continue
        }
        Quit
    }

    Set kanji = ..ReadRequiredField("Kanji","","KANJI")
    Set katakana = ..ReadRequiredField("Katakana","","KATAKANA")
    Set address = ..ReadRequiredField("Address","","ADDRESS")

    If ..DbAddRecord(name,kanji,katakana,address) {
        Do ..WriteCenteredLine("Added to ^Data: "_name,..MenuWidth())
    }

    Do ..Pause()
}

Method DrawRecordTableBorder()
{
    Set tw = 125
    Write ..Spaces(..LeftPad(tw))
    Write "+------+----------------------+----------------------+----------------------+----------------------+---------------------+----------+",!
}

Method ShowNames()
{
    Set tw = 125

    Do ..ClearScreen()
    Do ..DrawHeader("NAME TABLE FROM ^Data",tw)

    If ..DbCount()=0 {
        Do ..WriteCenteredLine("No records found in ^Data.",tw)
        Quit
    }

    Set pad = ..LeftPad(tw)

    Do ..DrawRecordTableBorder()
    Write ..Spaces(pad)
    Write "|",..FitCell("No",6)
    Write "|",..FitCell("Name",22)
    Write "|",..FitCell("Kanji",22)
    Write "|",..FitCell("Katakana",22)
    Write "|",..FitCell("Address",22)
    Write "|",..FitCell("Added DateTime",21)
    Write "|",..FitCell("Barcode",10)
    Write "|",!
    Do ..DrawRecordTableBorder()

    Set id = 0
    For {
        Set id = $Order(^Data(..DbRoot(),"Records",id))
        Quit:id=""

        Set item = ^Data(..DbRoot(),"Records",id)
        Set oneName = $ListGet(item,1)
        Set oneKanji = $ListGet(item,2)
        Set oneKatakana = $ListGet(item,3)
        Set oneAddress = $ListGet(item,4)
        Set oneDate = ..NormalizeDateTime($ListGet(item,5))
        Set oneBarcode = ..CleanBarcodeValue(..MakeBarcodeValue(id))

        Write ..Spaces(pad)
        Write "|",..FitCell(id,6)
        Write "|",..FitCell(oneName,22)
        Write "|",..FitCell(oneKanji,22)
        Write "|",..FitCell(oneKatakana,22)
        Write "|",..FitCell(oneAddress,22)
        Write "|",..FitCell(oneDate,21)
        Write "|",..FitCell(oneBarcode,10)
        Write "|",!
    }

    Do ..DrawRecordTableBorder()
}

Method UpdateNameAdmin()
{
    If '..CheckAdmin() {
        Quit
    }

    Do ..ShowNames()

    If ..DbCount()=0 {
        Do ..Pause()
        Quit
    }

    Set pad = ..LeftPad(..MenuWidth())

    For {
        Write !
        Write ..Spaces(pad),"Enter No to update >> "
        Read id

        If id="" {
            Do ..WriteCenteredLine("Number cannot be empty.",..MenuWidth())
            Continue
        }

        Set item = ..DbGetRecord(id)
        If item="" {
            Do ..WriteCenteredLine("Invalid number.",..MenuWidth())
            Continue
        }

        Quit
    }

    Set oldName = $ListGet(item,1)
    Set oldKanji = $ListGet(item,2)
    Set oldKatakana = $ListGet(item,3)
    Set oldAddress = $ListGet(item,4)

    Write !
    Do ..WriteCenteredLine("Press Enter only = keep old value",..MenuWidth())

    For {
        Set name = ..ReadRequiredField("New Name",oldName)
        If ..DbRecordExistsByName(name,id) {
            Do ..WriteCenteredLine("Duplicate name: "_name,..MenuWidth())
            Continue
        }
        Quit
    }

    Set kanji = ..ReadRequiredField("New Kanji",oldKanji,"KANJI")
    Set katakana = ..ReadRequiredField("New Katakana",oldKatakana,"KATAKANA")
    Set address = ..ReadRequiredField("New Address",oldAddress,"ADDRESS")

    If ..DbUpdateRecord(id,name,kanji,katakana,address) {
        Do ..WriteCenteredLine("Update success.",..MenuWidth())
    }

    Do ..Pause()
}

Method DeleteNameAdmin()
{
    If '..CheckAdmin() {
        Quit
    }

    Do ..ShowNames()

    If ..DbCount()=0 {
        Do ..Pause()
        Quit
    }

    Set pad = ..LeftPad(..MenuWidth())
    Write !
    Write ..Spaces(pad),"Enter No to delete >> "
    Read id

    If ..DbDeleteRecord(id) {
        Do ..WriteCenteredLine("Delete success.",..MenuWidth())
    }

    Do ..Pause()
}

//////////////////////////////////////////////
// BARCODE
//////////////////////////////////////////////

Method MakeBarcodeValue(pId As %Integer) As %String
{
    Quit "*" _ ..Pad6(pId) _ "*"
}

Method CleanBarcodeValue(pBarcode As %String) As %String
{
    Set code = $ZStrip(pBarcode,"<>W")
    Set code = $Replace(code,"*","")
    Set code = $ZCONVERT(code,"U")
    Quit code
}

Method ShowRecordDetailById(pId As %Integer)
{
    Set item = ..DbGetRecord(pId)

    If item="" {
        Do ..WriteCenteredLine("Barcode data not found.",..MenuWidth())
        Quit
    }

    Do ..DrawHeader("BARCODE RESULT",..MenuWidth())
    Do ..WriteInfoLine("No",pId,..MenuWidth())
    Do ..WriteInfoLine("Barcode",..MakeBarcodeValue(pId),..MenuWidth())
    Do ..WriteInfoLine("Name",$ListGet(item,1),..MenuWidth())
    Do ..WriteInfoLine("Kanji",$ListGet(item,2),..MenuWidth())
    Do ..WriteInfoLine("Katakana",$ListGet(item,3),..MenuWidth())
    Do ..WriteInfoLine("Address",$ListGet(item,4),..MenuWidth())
    Do ..WriteInfoLine("Added DateTime",..NormalizeDateTime($ListGet(item,5)),..MenuWidth())
}

Method SearchByBarcode()
{
    Do ..ClearScreen()
    Do ..DrawHeader("SEARCH BY BARCODE",..MenuWidth())

    If ..DbCount()=0 {
        Do ..WriteCenteredLine("No records found in ^Data.",..MenuWidth())
        Do ..Pause()
        Quit
    }

    Set pad = ..LeftPad(..MenuWidth())
    Write ..Spaces(pad),"Scan Barcode >> "
    Read barcode

    Set id = ..DbFindIdByBarcode(barcode)

    Do ..ClearScreen()
    If id=0 {
        Do ..DrawHeader("BARCODE RESULT",..MenuWidth())
        Do ..WriteCenteredLine("Barcode data not found: "_..CleanBarcodeValue(barcode),..MenuWidth())
        Do ..Pause()
        Quit
    }

    Do ..ShowRecordDetailById(id)
    Do ..Pause()
}

//////////////////////////////////////////////
// TXT / CSV / EXCEL
//////////////////////////////////////////////

Method SaveToTxt(pFilePath As %String = "")
{
    If pFilePath="" {
        Set pFilePath = ..NameFilePath()
    }

    If ..DbCount()=0 {
        Do ..WriteCenteredLine("No records to save.",..MenuWidth())
        Quit
    }

    Set file = ##class(%Stream.FileCharacter).%New()
    Set file.Filename = pFilePath
    Set file.TranslateTable = "UTF8"

    Set sc = file.LinkToFile(pFilePath)
    If $SYSTEM.Status.IsError(sc) {
        Do ..WriteCenteredLine("Cannot open TXT file.",..MenuWidth())
        Quit
    }

    Do file.Clear()

    Set id = 0
    For {
        Set id = $Order(^Data(..DbRoot(),"Records",id))
        If id="" {
            Quit
        }

        Set item = ^Data(..DbRoot(),"Records",id)
        Do file.WriteLine(id_","_$ListGet(item,1)_","_$ListGet(item,2)_","_$ListGet(item,3)_","_$ListGet(item,4)_","_..NormalizeDateTime($ListGet(item,5)))
    }

    Do file.%Save()
    Do file.%Close()
    Do ..WriteCenteredLine("Saved to TXT: "_pFilePath,..MenuWidth())
}

Method ImportFromTxt(pFilePath As %String = "", pReload As %Boolean = 0)
{
    If '..CheckAdmin() {
        Quit
    }

    If pFilePath="" {
        Set pFilePath = ..NameFilePath()
    }

    Set file = ##class(%Stream.FileCharacter).%New()
    Set file.Filename = pFilePath
    Set file.TranslateTable = "UTF8"

    Set sc = file.LinkToFile(pFilePath)
    If $SYSTEM.Status.IsError(sc) {
        Do ..WriteCenteredLine("TXT file not found.",..MenuWidth())
        Quit
    }

    If pReload {
        Kill ^Data(..DbRoot(),"Records")
        Kill ^Data(..DbRoot(),"NameIndex")
        Set ^Data(..DbRoot(),"LastId") = 0
    }

    Set insertCnt = 0
    Set skipCnt = 0

    While 'file.AtEnd {
        Set line = file.ReadLine()
        If line'="" {
            If $Piece(line,",",1)?1.N {
                Set oneName = $Piece(line,",",2)
                Set oneKanji = $Piece(line,",",3)
                Set oneKatakana = $Piece(line,",",4)
                Set oneAddress = $Piece(line,",",5)
                Set oneDate = $Piece(line,",",6,99)
            } Else {
                Set oneName = $Piece(line,",",1)
                Set oneKanji = $Piece(line,",",2)
                Set oneKatakana = $Piece(line,",",3)
                Set oneAddress = $Piece(line,",",4)
                Set oneDate = $Piece(line,",",5,99)
            }

            If oneName'="" {
                If '..DbRecordExistsByName(oneName) {
                    If ..DbAddRecord(oneName,oneKanji,oneKatakana,oneAddress,oneDate) {
                        Set insertCnt = insertCnt + 1
                    } Else {
                        Set skipCnt = skipCnt + 1
                    }
                } Else {
                    Set skipCnt = skipCnt + 1
                }
            }
        }
    }

    Do file.%Close()
    Do ..WriteCenteredLine("TXT import success. Inserted="_insertCnt_" Skipped="_skipCnt,..MenuWidth())
}

Method ReloadFromTxt(pFilePath As %String = "")
{
    Do ..ImportFromTxt(pFilePath,1)
}

Method SaveToCsv(pFilePath As %String = "")
{
    If pFilePath="" {
        Set pFilePath = ..CsvFilePath()
    }

    If ..DbCount()=0 {
        Do ..WriteCenteredLine("No records to save.",..MenuWidth())
        Quit
    }

    Set file = ##class(%Stream.FileCharacter).%New()
    Set file.Filename = pFilePath
    Set file.TranslateTable = "UTF8"

    Set sc = file.LinkToFile(pFilePath)
    If $SYSTEM.Status.IsError(sc) {
        Do ..WriteCenteredLine("Cannot open CSV file.",..MenuWidth())
        Quit
    }

    Do file.Clear()
    Do file.Write($Char(65279))
    Do file.WriteLine("No,Name,Kanji,Katakana,Address,AddedDateTime,Barcode")

    Set id = 0
    For {
        Set id = $Order(^Data(..DbRoot(),"Records",id))
        If id="" {
            Quit
        }

        Set item = ^Data(..DbRoot(),"Records",id)
        Set line = id_","
        Set line = line_..CsvEscape($ListGet(item,1))_","
        Set line = line_..CsvEscape($ListGet(item,2))_","
        Set line = line_..CsvEscape($ListGet(item,3))_","
        Set line = line_..CsvEscape($ListGet(item,4))_","
        Set line = line_..CsvEscape(..NormalizeDateTime($ListGet(item,5)))_","
        Set line = line_..CsvEscape(..MakeBarcodeValue(id))
        Do file.WriteLine(line)
    }

    Do file.%Save()
    Do file.%Close()
    Do ..WriteCenteredLine("Saved to CSV: "_pFilePath,..MenuWidth())
}

Method SaveToExcelBarcode(pFilePath As %String = "")
{
    If pFilePath="" {
        Set pFilePath = ..ExcelFilePath()
    }

    If ..DbCount()=0 {
        Do ..WriteCenteredLine("No records to save.",..MenuWidth())
        Quit
    }

    Set file = ##class(%Stream.FileCharacter).%New()
    Set file.Filename = pFilePath
    Set file.TranslateTable = "UTF8"

    Set sc = file.LinkToFile(pFilePath)
    If $SYSTEM.Status.IsError(sc) {
        Do ..WriteCenteredLine("Cannot open Excel file.",..MenuWidth())
        Quit
    }

    Do file.Clear()
    Do file.Write($Char(65279))

    Do file.WriteLine("<html>")
    Do file.WriteLine("<head>")
    Do file.WriteLine("<meta charset='UTF-8'>")
    Do file.WriteLine("<style>")
    Do file.WriteLine("table { border-collapse: collapse; font-family: Calibri; font-size: 12pt; }")
    Do file.WriteLine("th, td { border: 1px solid #999; padding: 4px 8px; white-space: nowrap; }")
    Do file.WriteLine(".barcode { font-family: 'Libre Barcode 39', 'Code 39', 'Free 3 of 9'; font-size: 32pt; }")
    Do file.WriteLine("</style>")
    Do file.WriteLine("</head>")
    Do file.WriteLine("<body>")
    Do file.WriteLine("<table>")
    Do file.WriteLine("<tr><th>No</th><th>Name</th><th>Kanji</th><th>Katakana</th><th>Address</th><th>AddedDateTime</th><th>Barcode</th></tr>")

    Set id = 0
    For {
        Set id = $Order(^Data(..DbRoot(),"Records",id))
        If id="" {
            Quit
        }

        Set item = ^Data(..DbRoot(),"Records",id)
        Do file.WriteLine("<tr>")
        Do file.WriteLine("<td>"_id_"</td>")
        Do file.WriteLine("<td>"_..HtmlEscape($ListGet(item,1))_"</td>")
        Do file.WriteLine("<td>"_..HtmlEscape($ListGet(item,2))_"</td>")
        Do file.WriteLine("<td>"_..HtmlEscape($ListGet(item,3))_"</td>")
        Do file.WriteLine("<td>"_..HtmlEscape($ListGet(item,4))_"</td>")
        Do file.WriteLine("<td>"_..HtmlEscape(..NormalizeDateTime($ListGet(item,5)))_"</td>")
        Do file.WriteLine("<td class='barcode'>"_..HtmlEscape(..MakeBarcodeValue(id))_"</td>")
        Do file.WriteLine("</tr>")
    }

    Do file.WriteLine("</table>")
    Do file.WriteLine("</body>")
    Do file.WriteLine("</html>")

    Do file.%Save()
    Do file.%Close()
    Do ..WriteCenteredLine("Saved to Excel Barcode: "_pFilePath,..MenuWidth())
}

Method ImportFromCsvUpsert(pFilePath As %String = "")
{
    If '..CheckAdmin() {
        Quit
    }

    If pFilePath="" {
        Set pFilePath = ..CsvFilePath()
    }

    Set file = ##class(%Stream.FileCharacter).%New()
    Set file.Filename = pFilePath
    Set file.TranslateTable = "UTF8"

    Set sc = file.LinkToFile(pFilePath)
    If $SYSTEM.Status.IsError(sc) {
        Do ..WriteCenteredLine("CSV file not found.",..MenuWidth())
        Quit
    }

    Do ..ClearScreen()
    Do ..DrawHeader("IMPORT CSV UPSERT TO ^Data",..MenuWidth())

    Set firstRow = 1
    Set insertCnt = 0
    Set updateCnt = 0
    Set sameCnt = 0
    Set skipCnt = 0

    While 'file.AtEnd {
        Set line = file.ReadLine()

        If firstRow {
            Set firstRow = 0
            Continue
        }

        If line="" {
            Continue
        }

        Set oneId = ..CsvUnquote($Piece(line,",",1))
        Set oneName = ..CsvUnquote($Piece(line,",",2))
        Set oneKanji = ..CsvUnquote($Piece(line,",",3))
        Set oneKatakana = ..CsvUnquote($Piece(line,",",4))
        Set oneAddress = ..CsvUnquote($Piece(line,",",5))
        Set oneDate = ..CsvUnquote($Piece(line,",",6))

        If oneName="" {
            Set skipCnt = skipCnt + 1
            Do ..WriteBlockLine("[SKIP NAME EMPTY]",..MenuWidth())
            Continue
        }

        If (oneId?1.N)&&($Data(^Data(..DbRoot(),"Records",oneId))) {
            Set item = ^Data(..DbRoot(),"Records",oneId)
            Set oldName = $ListGet(item,1)
            Set oldKanji = $ListGet(item,2)
            Set oldKatakana = $ListGet(item,3)
            Set oldAddress = $ListGet(item,4)
            Set oldDate = ..NormalizeDateTime($ListGet(item,5))

            If (oldName=oneName)&&(oldKanji=oneKanji)&&(oldKatakana=oneKatakana)&&(oldAddress=oneAddress)&&(oldDate=..NormalizeDateTime(oneDate)) {
                Set sameCnt = sameCnt + 1
                Do ..WriteBlockLine("[NO CHANGE] "_oneName,..MenuWidth())
            } Else {
                If ..DbUpdateRecord(oneId,oneName,oneKanji,oneKatakana,oneAddress) {
                    Do ..DbSaveRecord(oneId,oneName,oneKanji,oneKatakana,oneAddress,oneDate)
                    Set updateCnt = updateCnt + 1
                    Do ..WriteBlockLine("[UPDATE] "_oneName,..MenuWidth())
                } Else {
                    Set skipCnt = skipCnt + 1
                }
            }
        } Else {
            If '..DbRecordExistsByName(oneName) {
                If ..DbAddRecord(oneName,oneKanji,oneKatakana,oneAddress,oneDate) {
                    Set insertCnt = insertCnt + 1
                    Do ..WriteBlockLine("[INSERT] "_oneName,..MenuWidth())
                } Else {
                    Set skipCnt = skipCnt + 1
                }
            } Else {
                Set skipCnt = skipCnt + 1
                Do ..WriteBlockLine("[SKIP DUPLICATE] "_oneName,..MenuWidth())
            }
        }
    }

    Do file.%Close()

    Do ..WriteBlockLine("",..MenuWidth())
    Do ..WriteBlockLine("Inserted : "_insertCnt,..MenuWidth())
    Do ..WriteBlockLine("Updated  : "_updateCnt,..MenuWidth())
    Do ..WriteBlockLine("NoChange : "_sameCnt,..MenuWidth())
    Do ..WriteBlockLine("Skipped  : "_skipCnt,..MenuWidth())
    Do ..WriteBlockLine("Message  : CSV data has been reflected to ^Data.",..MenuWidth())
}

//////////////////////////////////////////////
// SHORTCUTS
//////////////////////////////////////////////

Method SaveAll()
{
    Do ..ClearScreen()
    Do ..DrawHeader("TATAH",..MenuWidth())
    Do ..SaveToTxt(..NameFilePath())
    Do ..SaveToCsv(..CsvFilePath())
    Do ..SaveToExcelBarcode(..ExcelFilePath())
    Do ..WriteCenteredLine("TXT + CSV + Excel Barcode saved successfully.",..MenuWidth())
    Do ..Pause()
}

//////////////////////////////////////////////
// MAIN
//////////////////////////////////////////////

Method Start()
{
    Do ..DbInit()

    For {
        Do ..ClearScreen()
        Do ..DrawHeader("WELCOME SCREEN",..MenuWidth())

        Do ..WriteBlockLine("1. Login",..MenuWidth())
        Do ..WriteBlockLine("2. Register",..MenuWidth())
        Do ..WriteBlockLine("3. Exit",..MenuWidth())
        Do ..DrawBorder(..MenuWidth())

        Set pad = ..LeftPad(..MenuWidth())
        Write !,..Spaces(pad),"Select >> "
        Read choice
        Set choice = ..Upper(choice)

        If choice="1" {
            If ..CheckLogin() {
                Do ..Menu()
            }
        } ElseIf choice="2" {
            Do ..RegisterUser()
        } ElseIf choice="3" {
            Do ..ClearScreen()
            Do ..DrawHeader("GOOD BYE",..MenuWidth())
            Do ..WriteCenteredLine("Program ended.",..MenuWidth())
            Quit
        } Else {
            Do ..WriteCenteredLine("Invalid selection.",..MenuWidth())
            Do ..Pause()
        }
    }
}

Method Menu()
{
    For {
        Do ..ClearScreen()
        Do ..DrawHeader("NAME MANAGER  -  ^Data DB",..MenuWidth())

        If ..IsAdmin() {
            Do ..WriteInfoLine("User",..CurrentUser_" (ADMIN)",..MenuWidth())
        } Else {
            Do ..WriteInfoLine("User",..CurrentUser_" (USER)",..MenuWidth())
        }

        Do ..WriteInfoLine("DB","^Data("""_..DbRoot()_""",""Records"")",..MenuWidth())
        Do ..WriteInfoLine("Count",..DbCount(),..MenuWidth())
        Do ..DrawSubBorder(..MenuWidth())

        Do ..WriteMenuItem(1,"Add record to ^Data","admin",..MenuWidth())
        Do ..WriteMenuItem(2,"Show ^Data records table","all",..MenuWidth())
        Do ..WriteMenuItem(3,"Update ^Data record","admin",..MenuWidth())
        Do ..WriteMenuItem(4,"Delete ^Data record","admin",..MenuWidth())
        Do ..WriteMenuItem(5,"Save ^Data to TXT","all",..MenuWidth())
        Do ..WriteMenuItem(6,"Import TXT to ^Data","admin",..MenuWidth())
        Do ..WriteMenuItem(7,"Reload TXT to ^Data","admin",..MenuWidth())
        Do ..WriteMenuItem(8,"Save ^Data CSV for Excel","all",..MenuWidth())
        Do ..WriteMenuItem(9,"Import CSV Upsert to ^Data","admin",..MenuWidth())
        Do ..WriteMenuItem(10,"Save Excel Barcode from ^Data","all",..MenuWidth())
        Do ..WriteMenuItem(11,"Search by Barcode from ^Data","all",..MenuWidth())
        Do ..WriteMenuItem(12,"Logout","",..MenuWidth())

        Do ..DrawSubBorder(..MenuWidth())
        Do ..WriteBlockLine("Command: tatah / txt / csv / xls / barcode / importtxt / reloadtxt / importcsv",..MenuWidth())
        Do ..DrawBorder(..MenuWidth())

        Set pad = ..LeftPad(..MenuWidth())
        Write !,..Spaces(pad),"Select >> "
        Read choice
        Set choice = ..Upper(choice)

        If choice="1" {
            Do ..AddNamesInteractive()

        } ElseIf choice="2" {
            Do ..ShowNames()
            Do ..Pause()

        } ElseIf choice="3" {
            Do ..UpdateNameAdmin()

        } ElseIf choice="4" {
            Do ..DeleteNameAdmin()

        } ElseIf choice="5" {
            Do ..ClearScreen()
            Do ..DrawHeader("SAVE TXT",..MenuWidth())
            Do ..SaveToTxt(..NameFilePath())
            Do ..Pause()

        } ElseIf choice="6" {
            Do ..ClearScreen()
            Do ..DrawHeader("IMPORT TXT",..MenuWidth())
            Do ..ImportFromTxt(..NameFilePath())
            Do ..Pause()

        } ElseIf choice="7" {
            Do ..ClearScreen()
            Do ..DrawHeader("RELOAD TXT",..MenuWidth())
            Do ..ReloadFromTxt(..NameFilePath())
            Do ..Pause()

        } ElseIf choice="8" {
            Do ..ClearScreen()
            Do ..DrawHeader("SAVE CSV",..MenuWidth())
            Do ..SaveToCsv(..CsvFilePath())
            Do ..Pause()

        } ElseIf choice="9" {
            Do ..ImportFromCsvUpsert(..CsvFilePath())
            Do ..Pause()

        } ElseIf choice="10" {
            Do ..ClearScreen()
            Do ..DrawHeader("SAVE EXCEL BARCODE",..MenuWidth())
            Do ..SaveToExcelBarcode(..ExcelFilePath())
            Do ..Pause()

        } ElseIf choice="11" {
            Do ..SearchByBarcode()

        } ElseIf choice="12" {
            Set ..CurrentUser = ""
            Quit

        } ElseIf choice="TATAH" {
            Do ..SaveAll()

        } ElseIf choice="TXT" {
            Do ..ClearScreen()
            Do ..DrawHeader("SAVE TXT",..MenuWidth())
            Do ..SaveToTxt(..NameFilePath())
            Do ..Pause()

        } ElseIf choice="CSV" {
            Do ..ClearScreen()
            Do ..DrawHeader("SAVE CSV",..MenuWidth())
            Do ..SaveToCsv(..CsvFilePath())
            Do ..Pause()

        } ElseIf choice="XLS" {
            Do ..ClearScreen()
            Do ..DrawHeader("SAVE EXCEL BARCODE",..MenuWidth())
            Do ..SaveToExcelBarcode(..ExcelFilePath())
            Do ..Pause()

        } ElseIf choice="BARCODE" {
            Do ..SearchByBarcode()

        } ElseIf choice="SEARCH" {
            Do ..SearchByBarcode()

        } ElseIf choice="IMPORTTXT" {
            Do ..ClearScreen()
            Do ..DrawHeader("IMPORT TXT",..MenuWidth())
            Do ..ImportFromTxt(..NameFilePath())
            Do ..Pause()

        } ElseIf choice="RELOADTXT" {
            Do ..ClearScreen()
            Do ..DrawHeader("RELOAD TXT",..MenuWidth())
            Do ..ReloadFromTxt(..NameFilePath())
            Do ..Pause()

        } ElseIf choice="IMPORTCSV" {
            Do ..ImportFromCsvUpsert(..CsvFilePath())
            Do ..Pause()

        } Else {
            Do ..WriteCenteredLine("Invalid selection.",..MenuWidth())
            Do ..Pause()
        }
    }
}

}
