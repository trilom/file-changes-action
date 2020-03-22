testOutput () {
    # read from var
    if [ "${2}" == "json" ]; then
        local output_length=$(echo "${1}" | jq '. | length')
    elif [ "${2}" == "," ]; then
        local output_length=$(awk -F"${2}" '{print NF-1}' <<< $(echo "${1}"))
    else
        local output_length=$(awk -F" " '{print NF-1}' <<< $(echo "${1}"))
    fi
    echo "$output_length"
}

testFile () {
    # read from file
    if [ "${2}" == "json" ]; then
        local file_length=$(jq -r '. | length' ${1}.json)
    elif [ "${2}" == "," ]; then
        local file_length=$(cat ${1}.csv | awk -F"${2}" '{print NF-1}')
    else
        local file_length=$(cat ${1}.txt | awk -F" " '{print NF-1}')
    fi
    echo "$file_length"
}

cleanTest () {
    rm -rf $1.json $1.csv $1.txt
}

prepareTest () {
    if [ "$1" == "simple_" ]; then
        local file=${1}${2}
        if [ "$3" == "json" ]; then
            declare ${file}='["functions/twitch-sadako/webhookSubscribeLambda/test/webhookSubscribeLambda.json", "functions/twitch-sadako/webhookSubscribeLambda/test/webhookSubscribeLambda_post.json", "functions/twitch-sadako/webhookSubscribeLambda/test/webhookSubscribeLambda_post.json", "functions/twitch-sadako/webhookSubscribeLambda/test/webhookSubscribeLambda_post.json"]'
            echo ${!file} > "${file}.json"
        elif [ "$3" == "," ]; then
            declare ${file}="functions/twitch-sadako/webhookSubscribeLambda/test/webhookSubscribeLambda.json,functions/twitch-sadako/webhookSubscribeLambda/test/webhookSubscribeLambda_post.json,functions/twitch-sadako/webhookSubscribeLambda/test/webhookSubscribeLambda_post.json,functions/twitch-sadako/webhookSubscribeLambda/test/webhookSubscribeLambda_post.json"
            echo ${!file} > "${file}.csv"
        else
            declare ${file}='functions/twitch-sadako/webhookSubscribeLambda/test/webhookSubscribeLambda.json functions/twitch-sadako/webhookSubscribeLambda/test/webhookSubscribeLambda_post.json functions/twitch-sadako/webhookSubscribeLambda/test/webhookSubscribeLambda_post.json functions/twitch-sadako/webhookSubscribeLambda/test/webhookSubscribeLambda_post.json'
            echo ${!file} > "${file}.txt"
        fi
    elif [ "$dev" == "dev" ] && [ "$1" != "simple_" ]; then
        if [ "$4" == "json" ]; then
            declare ${file}="$(cat ${2}.json)"
        elif [ "$4" == "," ]; then
            declare ${file}="$(cat ${2}.csv)"
        else
            declare ${file}="$(cat ${2}.txt)"
        fi
    fi
    echo "${!file}"
}

testResults () {
    if [ "$1" == 'simple_' ]; then
        result=3
        if [ "$2" == 'json' ]; then
            result=$(($result+1))
        fi
        # echo $result
        if [ $3 != $result ]; then
            echo "\033[1;91mTest failure expected:$result actual:$3 $1 '$2'\033[0m"
            exit 1;
        fi
    else
        if [ "$4" == 'files' ]; then
            result=72
        elif [ "$4" == 'files_added' ]; then
            result=51
        elif [ "$4" == 'files_modified' ]; then
            result=12
        elif [ "$4" == 'files_deleted' ]; then
            result=7
        fi
        if [ "$2" == 'json' ]; then
            result=$(($result+1))
        fi
        if [ $3 != $result ]; then
            echo "\033[1;91mTest failure expected:$result actual:$3 $1 $4 '$2'\033[0m"
            exit 1;
        fi
    fi
    echo "\t\t\033[1;92mTest success - expected $3 == $result for '$2' format.\033[0m"
}

runTest () {
    for prefix in "simple_" "none"; do \
        file=$1
        if [ "$prefix" == 'simple_' ]; then
            file=${prefix}${1}
        fi
        echo "\t\033[1;92mTesting $file with fileFormat '$2' and outputFormat '$3'\033[0m"
        if [ "$dev" == "dev" ]; then
            echo "\t\033[1;91mDEV MODE\033[0m"
        fi
        input="$(prepareTest $prefix $1 "$2" "$3")"
        local file_length=$(testFile $file "${2}")
        local output_length=$(testOutput "${input}" "${3}")
        testResults $prefix "${2}" $file_length $file
        testResults $prefix "${3}" $output_length $1
    done
    cleanTest simple_$file
}

test () {
    if [ "$output" == "" ] || [ "$fileOutput" == "" ]; then
        for format in "json" "," " "; do \
            echo '\033[1;92mFORMAT:"'$format'"\033[0m'
            for file in "files" "files_modified" "files_added" "files_deleted"; do \
                echo '\033[1;92mFILE:'$file'\033[0m'
                runTest $file "$format" "$format"
            done
        done
    else
        for file in "files" "files_modified" "files_added" "files_deleted"; do \
            echo '\033[1;92mFILE:'$file'\033[0m'
            runTest $file "$fileOutput" "$output"
        done
    fi
}

dev=$1

test
