window.onload = function () {

    //----------------------------ページロード後に変数を取得---------------------
    // ビデオ要素
    const video = document.getElementById("media");
    // 再生／中断ボタン
    const playOrPauseButton = document.getElementById("playOrPauseButton");
    // 先頭にボタン
    const stopButton = document.getElementById("stopButton");
    // 少し戻るボタン
    const backButton = document.getElementById("backButton");
    // 少し進むボタン
    const forwardButton = document.getElementById("forwardButton");
    // 高速再生ボタン
    const quickButton = document.getElementById("quickButton");
    // 低速再生ボタン
    const slowButton = document.getElementById("slowButton");
    // 通常再生ボタン
    const normalButton = document.getElementById("normalButton");

    // 原稿エリア
    const genko = document.getElementById("genko");
    //スキップ時間（秒）の設定
    const SKIP_TIME = 4;


    //-------------------------各種ボタンが押された時の処理-----------------------------------
    // 再生が開始されたら、ボタンのラベルを変更
    video.addEventListener("play", function () {
        if (video.src) {
            playOrPauseButton.textContent = "停止";
            document.getElementById("rate").innerHTML = video.playbackRate.toFixed(2);
        }
        // this.blur();
    }, false);

    // 一時中断されたら、ボタンのラベルを変更
    video.addEventListener("pause", function () {
        playOrPauseButton.textContent = "再生";
    }, false);

    // 再生／中断ボタンを押された
    playOrPauseButton.addEventListener("click", function () {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }, false);

    // 少し戻るボタンが押されたら、動画の再生位置を変更
    backButton.addEventListener("click", function () {
        video.currentTime = video.currentTime - SKIP_TIME;
    }, false);

    // 少し進むボタンが押されたら、動画の再生位置を変更
    forwardButton.addEventListener("click", function () {
        video.currentTime = video.currentTime + SKIP_TIME;
    }, false);


    // 終了ボタンをクリックされたら、ビデオを一時停止し、再生位置を初期に戻す
    stopButton.addEventListener("click", function () {
        video.pause();
        video.currentTime = video.initialTime || 0;
    }, false);

    // 高速再生ボタンをクリックされたら、再生速度を上げる
    quickButton.addEventListener("click", function () {
        video.playbackRate = video.playbackRate + 0.1;
        document.getElementById("rate").innerHTML = video.playbackRate.toFixed(2);
    }, false);

    // 低速再生ボタンをクリックされたら、再生速度を下げる
    slowButton.addEventListener("click", function () {
        video.playbackRate = video.playbackRate - 0.1;
        document.getElementById("rate").innerHTML = video.playbackRate.toFixed(2);
    }, false);

    // 通常再生ボタンをクリックされたら、再生速度をリセット
    normalButton.addEventListener("click", function () {
        video.playbackRate = 1;
        document.getElementById("rate").innerHTML = video.playbackRate.toFixed(2);
    }, false);


    // 原稿をローカルストレージに保存する.
    document.getElementById("store").addEventListener("click", function () {
        window.localStorage.setItem("bkup", genko.value);
    }, true);

    // ローカルストレージに保存しておいた原稿を戻す
    document.getElementById("restore").addEventListener("click", saveData, true);

    // マニュアル表示
    document.getElementById("manual").addEventListener("click", showManual, true);

    //テキストをクリップボードにコピー
    document.getElementById("copy").addEventListener("click", function () {
        const textarea = document.getElementById("genko");
        textarea.select();
        document.execCommand("copy");
    }, false);


    //ダウンロード処理
    document.getElementById("download").addEventListener("click", function () {
        const fileName = "transcription_" + new Date(Date.now() + 9 * 3600000).toISOString().replace(/[^\d]/g, "").slice(0, 14) + ".txt";
        const text = document.getElementById("genko").value;
        const blob = new Blob([text], { type: 'text/plain' });
        const aTag = document.createElement('a');
        aTag.href = URL.createObjectURL(blob);
        aTag.target = '_blank';
        aTag.download = fileName;
        aTag.click();
        URL.revokeObjectURL(aTag.href);
    }, false);



    //---------------------------------------ショートカットキーの処理-----------------------

    window.document.onkeydown = function (evt) {

        const keyCode = evt.code;

        if (evt.shiftKey && !evt.altKey && !evt.ctrlKey && keyCode == "Space") { //Shift+Spaceで少し戻る
            backButton.click();
            evt.preventDefault();//テキストに改行やスペースが入らないようにイベントを無効化する
        }

        if (evt.shiftKey && !evt.altKey && !evt.ctrlKey && keyCode == "Enter") { //Shift+Returnで再生・停止
            playOrPauseButton.click();
            evt.preventDefault();//テキストに改行やスペースが入らないようにイベントを無効化する
        }
        if (evt.shiftKey && evt.altKey && !evt.ctrlKey && keyCode == "Space") { //Shift+option(alt)+Spaceで少し進める
            forwardButton.click();
            evt.preventDefault();//テキストに改行やスペースが入らないようにイベントを無効化する
        }


    }


    //-------------------- no focus 処理　--------------------

    //作業中にnoFocusクラスが設定されている要素をクリックした時に原稿エリアにカーソルを戻す
    //要素が選択されている時にEnterやSpaceを押して予期しない動作が起こることも防ぐ

    const noFocus = document.querySelectorAll(".noFocus");
    noFocus.forEach((e) => {
        e.addEventListener("focus", function () {
            genko.focus();
        }, true);
    });



    //---------------------日本語括弧の自動補完機能

    const input_element = document.getElementById('genko');
    // 入力終了時に内容をチェックして置き換える
    input_element.addEventListener('compositionend', function (e) {
        const data = e.data;
        switch (data) {
            case "「":
                complete_quote(input_element, '」');
                break;
            case "\”":
                replace_quote(input_element, '“”');
                break;
            case "｛":
                complete_quote(input_element, '｝');
                break;
            case "『":
                complete_quote(input_element, '』');
                break;
            case "’":
                replace_quote(input_element, '‘’');
                break;
            case "【":
                replace_quote(input_element, '】');
                break;
            case "［":
                replace_quote(input_element, '］');
                break;
            case "（":
                replace_quote(input_element, '）');
                break;
            default:
                break;
        }
    });

    //後ろに補完する関数
    function complete_quote(element, charactor) {
        const content = element.value;
        const len = content.length;
        const pos = element.selectionStart;
        element.value = content.substr(0, pos) + charactor + content.substr(pos, len);
        element.setSelectionRange(pos, pos);
    }
    //そっくり入れ替える関数
    function replace_quote(element, charactor) {
        const content = element.value;
        const len = content.length;
        const pos = element.selectionStart;
        element.value = content.substr(0, pos - 1) + charactor + content.substr(pos, len);
        element.setSelectionRange(pos, pos);
    }



    genko.focus();

}  // onload処理の終わり


//新しいビデオのパスを取得してセット
function setFilePath() {
    var fileInput = document.getElementById("fileInput");
    file = fileInput.files[0];
    var video = document.getElementById("media");
    video.src = URL.createObjectURL(file);
}



//---------------------------ウィンドウを閉じる時の警告--------------------------------

window.onbeforeunload = function (event) { event = event || window.event; return event.returnValue = '保存しないとやばくね？'; }

function saveData() {
    // 「OK」時の処理開始 ＋ 確認ダイアログの表示
    if (window.confirm('本当にいいんですね？')) {
        genko.value = window.localStorage.getItem("bkup") || ""; //読み込み
    }
    // 「OK」時の処理終了// 「キャンセル」時の処理開始
    else {
        window.alert('キャンセルされました'); // 警告ダイアログを表示
    }
    // 「キャンセル」時の処理終了
}

//マニュアルの表示
function showManual() {
    let man_txt = document.getElementById("man_txt");
    man_txt.style.display = (man_txt.style.display == "none") ? "block" : "none";
}


