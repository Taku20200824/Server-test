Class Test.Sample Extends %RegisteredObject
{
    Property Name As %String;
    Property Age As %Integer;

    Method ShowInfo()
    {
        Write "5. Method ShowInfo() дуудагдлаа", !
        Write "6. ..Name property-ийн утга = ", ..Name, !
        Write "7. ..Age property-ийн утга  = ", ..Age, !
        Write "8. Method ShowInfo() дууслаа", !
    }

    ClassMethod Run()
    {
        Write "1. ClassMethod Run() эхэллээ", !

        Write "2. Test.Sample class-аас object үүсгэж байна", !
        Set obj = ##class(Test.Sample).%New()

        Write "3. Object-ийн Name property-д утга өгч байна", !
        Set obj.Name = "Bat"

        Write "4. Object-ийн Age property-д утга өгч байна", !
        Set obj.Age = 25

        Write "5. Object-ийн Method ShowInfo()-г дуудаж байна", !
        Do obj.ShowInfo()

        Write "9. ClassMethod Run() дууслаа", !
    }
}