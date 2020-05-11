let user_icon = document.querySelector('.user-header__icon');
user_icon.addEventListener('click', function(e)  {
    let user_menu = document.querySelector('.user-header__menu');
    user_menu.classList.toggle('_active');      
})

//// чтобы кликнув в любом месте user-header__menu закрывалось:
document.documentElement.addEventListener('click', function(e) {
    if(!e.target.closest(".user-header")) { // если в предках нет .user-header
       
        let  user_menu = document.querySelector('.user-header__menu');
        user_menu.classList.remove('_active');     
    }
})
///////////////////////////////////////////////////////////