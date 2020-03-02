# inputs
# fileOutput="json"
# output="json"

for type in "" "_modified" "_added" "_deleted"; do \
    # build filename
    file=test$type
    echo 'FILE: '$file
    # read from file
    if [ "$fileOutput" == "json" ]; then
        file_length=$(jq -r '.[0] | length' $file.json)
    elif [ "$fileOutput" == "," ]; then
        file_length=$(cat $file.csv | awk -F$"," '{print NF-1}')
    else
        file_length=$(cat $file.txt | awk -F"$fileOutput" '{print NF-1}')
    fi

    # read from var
    if [ "$output" == "json" ]; then
        # file_string=$(cat ${file}.json)
        # echo 'FILE_STRING: '$file_string
        output_length=$(echo $file | jq '.[0] | length')
    else
        # file_string=$(cat ${file}.csv)
        # echo 'FILE_STRING: '$file_string
        output_length=$(awk -F"$output" '{print NF-1}' <<< $(echo $file))
    fi
    echo 'FILE_LENGTH':$file_length
    echo 'OUTPUT_LENGTH':$output_length
done 
