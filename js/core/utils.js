// utils.js - ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ

/**
 * КОПИРОВАНИЕ ТЕКСТА В БУФЕР ОБМЕНА
 * Универсальная функция для копирования любого текста
 */
window.copyToClipboard = function(textToCopy) {
    // Если не передали текст, пытаемся взять из результата
    if (!textToCopy) {
        const resultElement = document.querySelector('#result .designation');
        if (resultElement) {
            textToCopy = resultElement.textContent.replace(/\s+/g, ' ').trim();
        } else {
            alert('Сначала сгенерируйте обозначение!');
            return;
        }
    }

    copyTextToClipboard(textToCopy);
};

/**
 * УНИВЕРСАЛЬНАЯ ФУНКЦИЯ КОПИРОВАНИЯ
 */
function copyTextToClipboard(text) {
    if (!text) return false;

    if (navigator.clipboard && window.isSecureContext) {
        // Modern asynchronous API
        navigator.clipboard.writeText(text)
            .then(() => showSuccessNotification())
            .catch(err => {
                console.error('Async copy failed:', err);
                fallbackCopy(text);
            });
    } else {
        // Fallback for older browsers or HTTP context
        fallbackCopy(text);
    }
}

/**
 * ЗАПАСНОЙ ВАРИАНТ
 */
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showSuccessNotification();
        } else {
            showErrorNotification();
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showErrorNotification(text);
    }

    document.body.removeChild(textArea);
}

/**
 * УВЕДОМЛЕНИЕ ОБ УСПЕХЕ
 */
function showSuccessNotification() {
    // Можно сделать красивый toast-уведомление
    alert('✅ Обозначение скопировано!');
}

/**
 * УВЕДОМЛЕНИЕ ОБ ОШИБКЕ
 */
function showErrorNotification(text = '') {
    if (text) {
        alert(`Скопируйте вручную:\n\n${text}`);
    } else {
        alert('Не удалось скопировать. Попробуйте вручную.');
    }
}

/**
 * ФОРМАТИРОВАНИЕ ОБОЗНАЧЕНИЯ
 * Можно добавить дополнительные утилиты
 */
window.formatDesignation = function(productName, numerator, denominator) {
    return `${productName} ${numerator}/${denominator}`;
};

/**
 * СОЗДАНИЕ DOM ЭЛЕМЕНТА
 */
window.createElement = function(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    // Атрибуты
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else if (key.startsWith('on')) {
            element[key] = value;
        } else {
            element.setAttribute(key, value);
        }
    }

    // Дочерние элементы
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });

    return element;
};