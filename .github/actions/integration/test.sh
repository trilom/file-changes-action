if [ "$fileOutput" == "json" ]; then
    extension='json'
    file_delim='json'
elif [ "$fileOutput" == "," ]; then
    extension='csv'
    file_delim=','
elif [ "$fileOutput" == " " ]; then
    extension='txt'
    file_delim=' '
else
    extension='txt'
    file_delim='_<br />&nbsp;&nbsp;_'
fi

if [ "$output" == "json" ]; then
    delim='json'
elif [ "$output" == "," ]; then
    delim=','
elif [ "$output" == " " ]; then
    delim=' '
else
    delim='_<br />&nbsp;&nbsp;_'
fi

for type in "" "_modified" "_added" "_deleted"; do \
    # build a variable for the file type name
    file=test$type
    # get the string from the output variable
    file_string=$(echo '$files$type')

    # read from var
    if [ "$extension" == "json" ]; then
        file_length=$(jq -r '.[0] | length' $file.$extension)
    elif [ "$extension" == "csv" ]; then
        file_length=$(cat $file.$extension | awk -F$file_delim '{print NF-1}')
    elif [ "$extension" == "txt" ]; then
        file_length=$(cat $file.$extension | awk -F$file_delim '{print NF-1}')
    fi

    if [ "$output" == "json" ]; then
        output_length=$(echo '$file_string' | jq '.[0] | length')
    elif [ "$output" == "csv" ]; then
        output_length=$(awk -F"$delim" '{print NF-1}' <<< '$(echo $file_string)')
    elif [ "$output" == "txt" ]; then
        output_length=$(awk -F"$delim" '{print NF-1}' <<< "$(echo $file_string)")
    fi
done 