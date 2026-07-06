Class Test.EmployeeReg Extends %RegisteredObject
{

ClassMethod Start()
{
    Set empNo=""
    Set nameKanji=""
    Set nameKana=""
    Set address=""
    Set row=1
    Set input=""
    Set msg=""

    For  {
        Do ..DrawScreen(empNo,nameKanji,nameKana,address,row,msg)
        Set msg=""

        Write !,"入力=> "
        Read input

        If ..Upper(input)="MENU" {
            Do ..ShowMenu()
            Continue
        }

        If input="$" {
            Write !,"PG終了",!
            Quit
        }

        If input="/" {
            If row>1 {
                Set row=row-1
            }
            Continue
        }

        If input="//" {
            Set row=1
            Continue
        }

        If input="@" {
            Set msg=..Register(empNo,nameKanji,nameKana,address)
            If msg="登録しました。" {
                Set empNo=""
                Set nameKanji=""
                Set nameKana=""
                Set address=""
                Set row=1
            }
            Continue
        }

        If ..Upper(input)="DEL" {
            Set msg=..Delete(empNo,.nameKanji,.nameKana,.address,.row)
            If msg="削除しました。" {
                Set empNo=""
                Set nameKanji=""
                Set nameKana=""
                Set address=""
                Set row=1
            }
            Continue
        }

        If row=1 {
            If '..IsValidEmpNo(input) {
                Set msg="社員番号は数字4桁以内です。"
                Continue
            }

            Set empNo=input
            If empNo="" {
                Set msg="社員番号を入力してください。"
                Continue
            }

            If $Data(^Test.EmployeeReg(empNo)) {
                Do ..LoadEmployee(empNo,.nameKanji,.nameKana,.address)
                Set msg="登録済みデータを表示しました。"
            } Else {
                Set nameKanji=""
                Set nameKana=""
                Set address=""
                Set msg="新規入力です。"
            }

            Set row=2
            Continue
        }

        If row=2 {
            If '..IsValidKanjiName(input) {
                Set msg="氏名漢字は全角のみ、間に全角スペース可です。"
                Continue
            }
            Set nameKanji=input
            Set row=3
            Continue
        }

        If row=3 {
            If '..IsValidKanaName(input) {
                Set msg="氏名カナは半角カナのみ、間に半角スペース可です。"
                Continue
            }
            Set nameKana=input
            Set row=4
            Continue
        }

        If row=4 {
            If '..IsValidAddress(input) {
                Set msg="住所は全角のみ可能です。"
                Continue
            }
            Set address=input
            Set msg="入力完了です。@で登録してください。"
            Continue
        }
    }
}

ClassMethod DrawScreen(empNo As %String, nameKanji As %String, nameKana As %String, address As %String, row As %Integer, msg As %String = "")
{
    Write #
    Write "処理：社員登録プログラム",!
    Write "ターミナル起動イメージ",!!
    Write "┌──────────────────────────────────────────────┐",!
    Write "│***社員登録PG***                              │",!
    Do ..WriteRow(1,"社員番号",empNo,row)
    Do ..WriteRow(2,"氏名漢字",nameKanji,row)
    Do ..WriteRow(3,"氏名カナ",nameKana,row)
    Do ..WriteRow(4,"住　　所",address,row)
    Write "│                                              │",!
    Write "│<@:登録 DEL:削除 /:一行上げ //:社員番号へ $:終了>│",!
    Write "└──────────────────────────────────────────────┘",!

    If msg'="" {
        Write !,"メッセージ：",msg,!
    }
}

ClassMethod WriteRow(no As %Integer, label As %String, value As %String, currentRow As %Integer)
{
    Set mark=" "
    If no=currentRow {
        Set mark=">"
    }

    Set line="│"_mark_no_"   "_label_"="_value
    Write $Extract(line_..Space(46),1,48)_"│",!
}

ClassMethod Space(cnt As %Integer) As %String
{
    Set s=""
    For i=1:1:cnt {
        Set s=s_" "
    }
    Quit s
}

ClassMethod ShowMenu()
{
    Write #
    Write "******** メニュー ********",!!
    Write "入力中に使えるコマンド",!!
    Write "@    : 登録",!
    Write "DEL  : 削除",!
    Write "/    : 一行上へ移動",!
    Write "//   : 社員番号へ移動",!
    Write "$    : PG終了",!
    Write "menu : このヘルプ表示",!!
    Write "Enterで戻る..."
    Read x
}

ClassMethod Register(empNo As %String, nameKanji As %String, nameKana As %String, address As %String) As %String
{
    If empNo="" {
        Quit "社員番号を入力してください。"
    }

    If '..IsValidEmpNo(empNo) {
        Quit "社員番号は数字4桁以内です。"
    }

    If nameKanji="" {
        Quit "氏名漢字を入力してください。"
    }

    If '..IsValidKanjiName(nameKanji) {
        Quit "氏名漢字は全角のみ、間に全角スペース可です。"
    }

    If nameKana="" {
        Quit "氏名カナを入力してください。"
    }

    If '..IsValidKanaName(nameKana) {
        Quit "氏名カナは半角カナのみ、間に半角スペース可です。"
    }

    If address="" {
        Quit "住所を入力してください。"
    }

    If '..IsValidAddress(address) {
        Quit "住所は全角のみ可能です。"
    }

    Set ^Test.EmployeeReg(empNo)=nameKanji_$C(1)_nameKana_$C(1)_address_$C(1)_$H
    Quit "登録しました。"
}

ClassMethod Delete(empNo As %String, ByRef nameKanji As %String, ByRef nameKana As %String, ByRef address As %String, ByRef row As %Integer) As %String
{
    If empNo="" {
        Quit "社員番号を入力してください。"
    }

    If '$Data(^Test.EmployeeReg(empNo)) {
        Quit "削除対象データがありません。"
    }

    Kill ^Test.EmployeeReg(empNo)
    Set nameKanji=""
    Set nameKana=""
    Set address=""
    Set row=1

    Quit "削除しました。"
}

ClassMethod LoadEmployee(empNo As %String, ByRef nameKanji As %String, ByRef nameKana As %String, ByRef address As %String)
{
    Set rec=$Get(^Test.EmployeeReg(empNo))
    Set nameKanji=$Piece(rec,$C(1),1)
    Set nameKana=$Piece(rec,$C(1),2)
    Set address=$Piece(rec,$C(1),3)
}

ClassMethod Upper(txt As %String) As %String
{
    Quit $ZCONVERT(txt,"U")
}

ClassMethod IsValidEmpNo(txt As %String) As %Boolean
{
    If txt="" Quit 0
    If txt'?1.4N Quit 0
    Quit 1
}

ClassMethod IsValidKanjiName(txt As %String) As %Boolean
{
    Quit ..IsFullWidthOnly(txt,1)
}

ClassMethod IsValidAddress(txt As %String) As %Boolean
{
    Quit ..IsFullWidthOnly(txt,1)
}

ClassMethod IsValidKanaName(txt As %String) As %Boolean
{
    If txt="" Quit 0

    For i=1:1:$Length(txt) {
        Set ch=$Extract(txt,i)
        Set code=$WASCII(ch)

        ; 半角スペース
        If code=32 {
            Continue
        }

        ; 半角カナ
        If (code>=65377)&&(code<=65439) {
            Continue
        }

        Quit 
    }

    Quit 1
}

ClassMethod IsFullWidthOnly(txt As %String, allowFullSpace As %Boolean = 1) As %Boolean
{
    If txt="" Quit 0

    For i=1:1:$Length(txt) {
        Set ch=$Extract(txt,i)
        Set code=$WASCII(ch)

        ; 全角スペース
        If allowFullSpace,(code=12288) {
            Continue
        }

        ; 半角ASCII禁止
        If code<256 {
            Quit
        }

        ; 半角カナ禁止
        If (code>=65377)&&(code<=65439) {
            Quit
        }
    }

    Quit 1
}

}