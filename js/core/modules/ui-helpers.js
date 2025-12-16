// core/modules/ui-helpers.js
// ==========================================
// 🎨 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ПОСТРОЕНИЯ ИНТЕРФЕЙСА
// ==========================================

/**
 * ДОБАВИТЬ ВЫПАДАЮЩИЙ СПИСОК (утилита)
 */
window.addSelectField = function(container, label, fieldName, options, cssClass = '') {
    const div = document.createElement('div');
    const className = cssClass || `${fieldName}-select`;

    div.innerHTML = `
        <label>${label}</label>
        <select class="${className} param-select">
            <option value="">-- Выбери --</option>
        </select>
    `;

    container.appendChild(div);

    const select = div.querySelector('select');
    options.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });

    return select;
};

/**
 * ДОБАВИТЬ КНОПКУ ГЕНЕРАЦИИ
 */
window.addGenerateButton = function(container, text, onClickFunction) {
    const button = document.createElement('button');
    button.className = 'generate-btn';
    button.textContent = text;
    button.onclick = onClickFunction;
    container.appendChild(button);
};

/**
 * ПОКАЗАТЬ РЕЗУЛЬТАТ ОБОЗНАЧЕНИЯ
 */
window.showDesignationResult = function(productName, numerator, denominator, fullDesignation) {
    const resultElement = document.getElementById('result');
    const container = document.getElementById('resultContainer');

    if (!resultElement || !container) {
        console.error('❌ Не найден элемент результата');
        return;
    }

    // Проверяем, есть ли знаменатель - определяет дробный или недробный формат
    const hasDenominator = denominator && denominator.trim() !== '';

    console.log('🎨 showDesignationResult:', {
        productName,
        numerator,
        denominator,
        hasDenominator,
        fullDesignation
    });

    if (hasDenominator) {
        // ДРОБНЫЙ ФОРМАТ (обычный)
        resultElement.innerHTML = `
            <div class="designation">
                <span class="product-name">${productName}</span>
                <span class="fraction">
                    <span class="numerator">${numerator}</span>
                    <span class="denominator">${denominator}</span>
                </span>
            </div>
            <div class="full-designation">
                <strong>Полное обозначение:</strong><br>${fullDesignation}
            </div>
        `;
    } else {
        // НЕДРОБНЫЙ ФОРМАТ (особые случаи, например трубы 12Х18Н10Т)
        // Проверяем, содержит ли fullDesignation productName в начале
        let displayText = fullDesignation;

        // Если fullDesignation начинается с productName и пробела, убираем для красивого отображения
        if (fullDesignation.startsWith(productName + ' ')) {
            displayText = fullDesignation.substring(productName.length + 1);
        }

        resultElement.innerHTML = `
            <div class="designation">
                <div style="text-align: center; padding: 15px;">
                    <span style="font-size: 20px; font-weight: bold; color: #2c3e50;">${productName}</span>
                    <div style="margin-top: 10px; font-size: 18px;">${displayText}</div>
                </div>
            </div>
            <div class="full-designation">
                <strong>Полное обозначение:</strong><br>${fullDesignation}
            </div>
        `;
    }

    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    console.log('✅ Результат отображен');
};

/**
 * ПОКАЗАТЬ СООБЩЕНИЕ ОБ ОШИБКЕ
 */
window.showError = function(message) {
    const resultElement = document.getElementById('result');
    const container = document.getElementById('resultContainer');

    if (!resultElement || !container) {
        console.error('❌ Не найден элемент результата');
        return;
    }

    resultElement.innerHTML = `
        <div class="error">
            ❌ ${message}
        </div>
    `;
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });
};

/**
 * ПОКАЗАТЬ ПРЕДУПРЕЖДЕНИЕ
 */
window.showWarning = function(message) {
    const resultElement = document.getElementById('result');
    const container = document.getElementById('resultContainer');

    if (!resultElement || !container) {
        console.error('❌ Не найден элемент результата');
        return;
    }

    resultElement.innerHTML = `
        <div class="warning">
            ⚠️ ${message}
        </div>
    `;
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });
};