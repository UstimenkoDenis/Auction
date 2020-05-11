// Находим элемент для перемещения с атрибутом data-move 
let dynamicElement = document.querySelector('a[data-move]');
// читаем параметры data-move // Первый содержит КУДА переместить, второй- КАКОЙ ПО СЧЕТУ (начинается с нуля)
// третий - при КАКОМ  разрешении
let params = dynamicElement.getAttribute('data-move')

// Преобразуем нашу строку params в массив
let arrParams = params.split(',');

// При ширине меньше 767px:
if(document.body.clientWidth <= +arrParams[2]) {
      
     
    console.log(document.body.clientWidth)

     // Создаем пункт назначения
    let destination = document.querySelector(arrParams[0]);
    console.log(destination);

    // Добавление элемента
    destination.appendChild(dynamicElement);
    
}


