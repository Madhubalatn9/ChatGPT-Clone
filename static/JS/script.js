function hideFunction() {
    const dropdownRecents = document.getElementById("dropdownRecents");
    if (!dropdownRecents) return;
    const currentDisplay = window.getComputedStyle(dropdownRecents).display;
    if (currentDisplay === "none") {
        dropdownRecents.style.display = "block";
    } else {
        dropdownRecents.style.display = "none";
    }
}

function showFunction() {
    const show = document.getElementById("show");
    if (!show) return;
    const currentDisplay = window.getComputedStyle(show).display;
    if (currentDisplay === "none") {
        dropdownRecentsDisplayBlock(show);
    } else {
        show.style.display = "none";
    }
}

function dropdownRecentsDisplayBlock(el) {
    el.style.display = "block";
}

function newShowFunction() {
    const newDropdownList = document.getElementById("newDropdownList");
    if (!newDropdownList) return;
    const currentDisplay = window.getComputedStyle(newDropdownList).display;
    if (currentDisplay === "none") {
        newDropdownList.style.display = "block";
    } else {
        newDropdownList.style.display = "none";
    }
}

const search_bar=document.getElementsByClassName("search-bar");
const input_area=document.getElementsByClassName("input-area");
const submit_btn=document.getElementsByClassName("submit-btn");

submit_btn.addEventListener('click',function(){
   const user_input=input_area.value;

   if (user_input.trim()){
         const user_input_div=document.createElement('div');
         user_input_div.className='user-message';
         user_input_div.textContent=user_input;
         search_bar.appendChild(user_input_div);

         search_bar.scrollTop=search_bar.scrollHeight;

         fetch('/get_response',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',

            },
            body:JSON.stringify({ question: user_input }),
         })
         .then(response => response.json())
         .then(data => {
            const bot_Message_Div=document.createElement('div');
            bot_Message_Div.className='bot-message';
            bot_Message_Div.textContent=data.response;
            search_bar.appendChild(bot_Message_Div);

            search_bar.scrollTop=search_bar.scrollHeight;
         })
         .catch(error => {
            const error_Message_div=document.createElement('div');
            error_Message_div.className='bot-error-message';
            error_Message_div.textConent="Error: Unable to fetch response";
            search_bar.appendChild(error_Message_div);
         });
    input_area.value='';

   }
});
input_area.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                sendBtn.click();
            }
        });
