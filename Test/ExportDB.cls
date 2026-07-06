Class Test.ExportDb Extends %RegisteredObject
{

/// 複数のSQLテーブルを .txt ファイルにエクスポートします。
ClassMethod ExportData(pTableList As %List = "", pDirectory As %String = "C:\temp\", pDbPackage As %String = "Db") As %Status
{
    Set sc = $$$OK
    // rootフォルダのしたに実行際のサブフォルダ作成
    Set pDirectory = pDirectory_$ZStrip($ZDatetime($Horolog , 8, 1), "*P")_"\"
    
    Try {
        
        Set:('$ListLength(pTableList)) pTableList = $ListBuild("MstInternationalizationPor","MstMenu","MstMenuPermission","MstScreen","MstScreenPermission","MstSystemSetting")
        
        // グロバル名調整。※(Db.MstMenu or MstMenu) → Db.MstMenu
        Set tNormalizedTableList = ""
        For i = 1 : 1 : $ListLength(pTableList)
        {
            Set tableName = $ListGet(pTableList, i)
            Set tableName = $List($ListFromString(tableName,"."),*)
            // 先頭にDbパッケージ名を付ける
            Set tableName = pDbPackage_"."_tableName

            Set tCheckTableName = "^"_tableName
            Set:($Data(@tCheckTableName)) $List(tNormalizedTableList,*+1) = tableName
        }
        // 出力グロバル存在しチェック
        Return:('$ListLength((tNormalizedTableList))) sc

        If ('##class(%File).DirectoryExists(pDirectory)) {
            Set sc = ##class(%File).CreateDirectoryChain(pDirectory)
            Return:($$$ISERR(sc)) sc
        }
        // グローバル毎出力
        For i=1:1:$ListLength(tNormalizedTableList) {
            Set tableName = $ListGet(tNormalizedTableList, i)
            Write !, "Exporting: ", tableName

            Set rowCount = 0
            Kill tableData
            Set tableData = 0
            Set sc = ..ExportGlobal(tableName, pDirectory, .rowCount, .tableData)
            If $$$ISERR(sc) Quit
            Write " (", rowCount, " rows)"
        }
        If $$$ISOK(sc) {
            Write !, "データ出力終了。○"
        } else {
            Write !, "データ出力エラー。×"
        }
    }
    Catch ex {
        Set sc = ex.AsStatus()
    }
    
    If $$$ISERR(sc) Do $System.Status.DisplayError(sc)
    
    Quit sc
}

/// ZWコマンドを使用してグローバルをエクスポートします
ClassMethod ExportGlobal(pTableName As %String, pDirectory As %String, Output pRowCount, Output pTableData) As %Status
{
    Set sc = $$$OK
    Set pRowCount = 0
    Kill pTableData
    Set pTableData = 0
    
    Set globalName = "^"_pTableName
    If '$Data(@globalName) {
        Write " (Global does not exist)"
        Quit sc
    }
    
    Set fileName = ##class(%File).NormalizeFilename(pTableName _ ".txt", pDirectory)
    Set tmpFile = fileName _ ".tmp"
    
    If ##class(%File).Exists(tmpFile) {
        Do ##class(%File).Delete(tmpFile)
    }
    
    Open tmpFile:("NWK\UTF8\"):3
    If ('$Test) {
        Set sc = $$$ERROR($$$GeneralError, "Cannot open temporary file")
        Quit sc
    }
    
    Try {
        Use tmpFile
        ZWrite @globalName
        Use 0
        Close tmpFile
        
        Set file = ##class(%File).%New(fileName)
        Set sc = file.Open("WSNK\UTF8\")
        Quit:($$$ISERR(sc))
        
        // UTF-8 BOM
        Do file.Write($Char(65279))
        
        Set tmpFileReader = ##class(%File).%New(tmpFile)
        Do tmpFileReader.Open("RUK\UTF8\")
        
        While 'tmpFileReader.AtEnd {
            Set line = tmpFileReader.ReadLine()
            If (line '= "") && (line '= globalName) {
                Set outputLine = "S " _ line
                Do file.Write(outputLine)
                Do file.Write($Char(13,10))  // Explicit CRLF
                Set pTableData($Increment(pTableData)) = outputLine
                Do $Increment(pRowCount)
            }
        }
        
        Do tmpFileReader.Close()
        Do file.Close()
        

        If ##class(%File).Exists(tmpFile) {
            Do ##class(%File).Delete(tmpFile)
        }
    }
    Catch ex {
        If ##class(%File).Exists(tmpFile) {
            Do ##class(%File).Delete(tmpFile)
        }
        Set sc = ex.AsStatus()
    }
    Quit sc
}

ClassMethod Execute(pFileName As %String) As %Status
{
    Set sc = $$$OK
    Set file = ##class(%File).%New(pFileName)
    Set sc = file.Open("RUK\UTF8\")
    If $$$ISERR(sc) Return sc
    
    Set successCount = 0
    Set errorCount = 0
    
    Try {
        While 'file.AtEnd {
            Set line = file.ReadLine()
            Continue:(line = "")
            
            // Remove BOM
            If $Length(line) > 0 && ($Ascii(line) = 65279) {
                Set line = $Extract(line,2,*)
            }
            Set line = $ZStrip(line, "*C", "", $Char(65279))
            
            Continue:($Extract(line,1,2) '= "S ")
            
            Set globalRef = $Piece($Piece(line, "=", 1), "S ", 2)
            
            Write !, "Line: ", $Extract(line,1,80)
            Write !, "Global: ", globalRef
            
            Try {
                Xecute line
                
                // Verify
                If $Data(@globalRef) {
                    Write " ✓ SUCCESS"
                    Do $Increment(successCount)
                } Else {
                    Write " ✗ EXECUTED BUT NOT SET"
                    Do $Increment(errorCount)
                }
            }
            Catch ex {
                Write " ✗ ERROR: ", ex.DisplayString()
                Do $Increment(errorCount)
            }
        }
        
        Write !!, "Summary for ", pFileName
        Write !, "Success: ", successCount
        Write !, "Errors: ", errorCount
        Write !, "Total: ", successCount + errorCount
        
    }
    Catch ex {
        Set sc = ex.AsStatus()
    }
    
    Do file.Close()
    Quit sc
}

}
