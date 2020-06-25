let project_folder = require("path").basename(__dirname) // будет такое имя как у папки в которой находится
let source_folder = "#src";
let fs = require('fs');                         // для работы с файловой системой


let path = {                                    // пути куда gulp будет выгружать обработанные файлы
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
    },
    src: {                                      // пути откуда gulp будет брать  файлы для обработки

        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"], // сначала читаем все html файлы в папке и потом делаем
     // исключение для всех файлов начинающихся с подчеркивания
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/app.js",
        img: source_folder + "/img/**/*.+(jpg|png|svg|gif|ico|webp)",     //   ** - все подпапки будем считывать
        fonts: source_folder + "/fonts/*.ttf",
    },
    watch: { // укажем пути к файлам которые нам нужно слушать постоянно и сразу что то на лету выполнять
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.+(jpg|png|svg|gif|ico|webp)",    
    },
    // объект отвечающий за удаление папки проекта
    clean: "./" + project_folder + "/"
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


let  gulp = require('gulp'),                       // подключаем gulp в нашем файле
    {src, dest} = require('gulp'),                      
    browsersync = require('browser-sync').create(), // обновление страницы 
    fileinclude = require('gulp-file-include'),    // сборка из разных блоков (header, footer)
    del = require('del'),                           // плагин для удаления dist
    scss = require('gulp-sass'),                    // Обработка файлов стилей scss 
    autoprefixer = require('gulp-autoprefixer'),    //добавляет  вендорные префиксы к нашим свойствам
    group_media = require('gulp-group-css-media-queries'), // собирает медиа запросы и группирует в конце 
    clean_css = require('gulp-clean-css'),         // чистит и сжимает наш css файл на выходе
    rename = require('gulp-rename'),               // переименование, используется при сжатии файлов
    uglify = require('gulp-uglify-es').default,    // Плагин для сжатия и оптимизации js
    imagemin = require('gulp-imagemin'),           // сжать без потери качества.
    webp = require('gulp-webp'),                   // чтобы gulp конвертировал в новый формат картинок  webp
    webphtml = require('gulp-webp-html'),          // GULP сам будет подключать к HTML блок для отображения картинок webp
    webpcss = require('gulp-webpcss'),             // для авто добавления в стили изображений webp
    svgSprite = require('gulp-svg-sprite'),        // svg
    ttf2woff = require('gulp-ttf2woff'),           //подключает и конвертирует шрифты за нас
    ttf2woff2 = require('gulp-ttf2woff2'),         //подключает и конвертирует шрифты за нас
    fonter = require('gulp-fonter');               //чтобы перевести из  otf в ttf 
    babel = require('gulp-babel');




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Функция которая будет обнавлять нашу страницу npm i browser-sync --save-dev


function browserSync(params) {
    browsersync.init({                          // подымаем сервер
        server: {                                  // задаем ему корневую папку
            baseDir: "./" + project_folder + "/" // базовая папка значение тоже что и для переменной clean
        },
        port: 3000,                             // на порту 3000
        notify: false                           // по умолчанию плагин отображает табличку - выключаем ее
    })
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// создадим функцию для работы с html файлами 
// результат этой функции  - копирование в папку назначения нашего index.html после чего перезагружаем браузер
function html() { 
    return src(path.src.html)  //указываем  источник
    // и прогоняем его через плагины (pipe в переводе - труба):
    .pipe(fileinclude())          // собирает один html из модульных html
    .pipe(webphtml())             // подключает правильно wamp картинки к html 
    .pipe(dest(path.build.html))  // указываем пункт назначения, перебросим файлы из исходной папки в папку назначения ()
    .pipe(browsersync.stream())   // gulp - обнови страницу
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function css() {  
    return src(path.src.css)            // указываем источник "/scss/style.scss"
    .pipe(                              
        scss({                          // прогоняем через плагин scss для перевода в css - файл 
            outputStyle: "expanded"     // указываем чтобы css файл формировался не сжатым
        })
    )
    .pipe(                              // прогоняем через плагин с группировкой всех media
        group_media()
    )
    .pipe(                              // прогон через плагин автопрефиксер 
        autoprefixer({
            overrideBrowserslist: ["last 5 versions"],  // браузеры которые нужно поддерживать - последние 5 версий
            cascade: true                               // стиль написания автопрефиксов - каскадный
        })
    )
    .pipe(webpcss())                      // прогон через плагин автоподключения webp изображений               
    // здесь у нас будет две выгрузки:
    .pipe(dest(path.build.css))          // загрузим до сжатия и переименования
    .pipe(clean_css())                  // чистим и сжимаем наш css файл 
    .pipe(                              // прогон через плагин переименования
        rename({
            extname: ".min.css"
        })
    )
    .pipe(dest(path.build.css))         // переименованный в папку назначения
    .pipe(browsersync.stream())         // обновляем страницу
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// обработка js файлов 
function js() { 
    return src(path.src.js)     //указываем  источник
    
    .pipe(fileinclude())        // собирает один js из модулей 
    .pipe(babel())              // транспилируем через babel 
    .pipe(dest(path.build.js))  //копируем его в папку назначения 

    .pipe(                      //  прогоняем через плагин сжатия js файла 
        uglify()
    )
    .pipe(                      // прогоняем через плагин переименования наш сжатый файл
        rename({
            extname: ".min.js"
        })
    )
    .pipe(dest(path.build.js))  // опять копируем его в папку назначения
    .pipe(browsersync.stream())  //обновляем страницу
}
// В итоге в папке назначения получится 2 файла собранных из модулей: один несжатый, другой сжатый

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



function images() { 
     return src(path.src.img)             //указываем  источник
    .pipe(                                // конвертируем в webp
        webp({
            quality: 70
        })
    )
    .pipe(dest(path.build.img))           //указываем пункт назначения куда выгрузит webp
    .pipe(src(path.src.img))              //указываем  источник
    .pipe(
        imagemin({                        // для браузеров не поддерживающих webp будет просто картинка - прогон через плагин сжатия
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 3          // 0 to 7
        })
    )
    .pipe(dest(path.build.img))           //указываем пункт назначения куда выгрузит обычные сжатые картинки
    .pipe(browsersync.stream())           //обновляем страницу
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Создадим не обычную функцию обработки
// а задачу которую нам нужно отдельно вызывать

gulp.task('svgSprite', function(){
    return gulp.src([source_folder + '/iconsprite/*.svg'])          //указываем  источник
    // обработчик
    .pipe(svgSprite({                                               // прогоняем через плагин svgSprite
        mode: {
            stack: {
                sprite: "../icons/icons.svg", // sprite filename
                example: true                      // создает html файл с примерами иконок показывает как подключать svg к html!!!!
            }
        }
    }
    ))
    .pipe(dest(path.build.img))                                    // выгружаем в папку с изображениями
})

// чтобы вызвать задачу пишем в терминале:    gulp svgSprite

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




function fonts(){
    src(path.src.fonts)                       //указываем  источник
    .pipe(ttf2woff())                         // прогоняем через плагин конвертации шрифтов
    .pipe(dest(path.build.fonts));            //указываем пункт назначения
     return src(path.src.fonts)               //указываем  источник
            .pipe(ttf2woff2())               // прогоняем через плагин конвертации шрифтов
            .pipe(dest(path.build.fonts));   //указываем пункт назначения

}




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////// Если в папке - источнике есть шрифты с расширением otf - переведем их в ttf выполнив задачу:     gulp otf2ttf /////


gulp.task('otf2ttf', function(){
    return src([source_folder + '/fonts/*.otf'])       // указываем  источник
    .pipe(fonter({                                     // прогоняем через плагин fonter
        formats: ['ttf']
    }))
    .pipe(dest(source_folder+ '/fonts/'));            // выгружаем в папку с исходниками
})



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// // будет отвечать за запись и подключение шрифтов к файлу стилей:

function fontsStyle(params) {

    let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss'); // считываем текст из источника -из файла font.scss
    if (file_content == '') {                                               // если пустой
        fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);           // записываем в него
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}


// Пустая callback функция - нужна для fontStyle
function cb() {

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// В GULP есть метод watch - он следит за измененим в файлах
// Если происходит изменение в файлах указанных в пути выполняется соответствующая функция-задача
// отслеживание изменения файлов
function watchFiles(params){ 
    gulp.watch([path.watch.html], html);    // внутри путь к файлам за которыми мы хотим следить
    gulp.watch([path.watch.css], css);      // слежка за scss 
    gulp.watch([path.watch.js], js);        // слежка за js файлом 
    gulp.watch([path.watch.img], images);   // слежка за картинками
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// функция для того чтобы чистить папку "пункт назначения" project_folder

function clean(params) {
    return del(path.clean);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// подружим функции с gulp - вклиниваем наши функции в процесс выполнения
let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), fontsStyle); // обработка html, css, js, images, fonts - одновременно 
let watch = gulp.parallel(build, watchFiles, browserSync);

// Подружим gulp с новыми переменными
exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch; // когда мы запускаем команду gulp , выполняется переменная по умолчанию , которая запускает browserSync
