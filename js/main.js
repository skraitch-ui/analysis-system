// main.js - ОПТИМИЗИРОВАННЫЙ

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Система запущена');

    // Ждём загрузки данных
    waitForData().then(() => {
        console.log('✅ Данные (материалы и индекс) загружены');

        // Инициализируем систему через функцию из app-core.js
        if (typeof window.initializeSystemAfterDataLoad === 'function') {
            window.initializeSystemAfterDataLoad();
        }
        // Если старая функция setupHandlers всё ещё есть (для обратной совместимости)
        else if (typeof setupHandlers === 'function') {
            setupHandlers();
        } else {
            console.error('❌ Не найдены функции инициализации');

            // Пробуем хотя бы настроить переключатель режима
            setupModeSwitcher();
        }
    }).catch(error => {
        console.error('❌ Ошибка загрузки данных:', error);
        manualCheck();
    });
});

function waitForData() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 100;
        const interval = 100;

        const checkInterval = setInterval(() => {
            attempts++;

            // Ждём загрузки ОБОИХ наборов данных
            if (window.blackMetals &&
                Object.keys(window.blackMetals).length > 0 &&
                window.indexData) {
                clearInterval(checkInterval);
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                reject(new Error('Данные не загрузились за 10 секунд'));
            }
        }, interval);
    });
}

function manualCheck() {
    console.log('=== РУЧНАЯ ПРОВЕРКА ===');
    console.log('1. window.blackMetals:', window.blackMetals ? `✅ ${Object.keys(window.blackMetals).length} материалов` : '❌ не загружен');
    console.log('2. window.indexData:', window.indexData ? `✅ загружен` : '❌ не загружен');
    console.log('3. window.initializeSystemAfterDataLoad:', typeof window.initializeSystemAfterDataLoad);

    // Пробуем разные способы инициализации
    if (typeof window.initializeSystemAfterDataLoad === 'function') {
        setTimeout(() => window.initializeSystemAfterDataLoad(), 500);
    } else if (typeof initializeSystem === 'function') {
        initializeSystem();
    } else {
        console.log('⚠️ Не удалось инициализировать систему');
    }
}

// Функция настройки переключателя режима
function setupModeSwitcher() {
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    if (modeRadios.length === 0) {
        console.error('❌ Переключатель режима не найден');
        return;
    }

    modeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (typeof window.changeMode === 'function') {
                window.changeMode(this.value);
            } else {
                alert('Ошибка: функция переключения режима не загружена');
            }
        });
    });
}