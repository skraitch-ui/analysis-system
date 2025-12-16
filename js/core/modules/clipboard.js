// core/modules/clipboard.js
// ==========================================
// 📋 ФУНКЦИИ ДЛЯ РАБОТЫ С БУФЕРОМ ОБМЕНА
// ==========================================

/**
 * КОПИРОВАНИЕ ОБОЗНАЧЕНИЯ В БУФЕР ОБМЕНА
 */
window.copyToClipboard = function() {
    const resultElement = document.querySelector('#result .designation');
    if (!resultElement) {
        alert('❌ Сначала сгенерируйте обозначение!');
        return;
    }

    const resultText = resultElement.textContent.trim();

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(resultText)
            .then(() => {
                alert('✅ Обозначение скопировано в буфер обмена!');
            })
            .catch(err => {
                console.error('❌ Ошибка копирования:', err);
                fallbackCopy(resultText);
            });
    } else {
        fallbackCopy(resultText);
    }

    function fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            alert('✅ Обозначение скопировано!');
        } catch (err) {
            alert('❌ Не удалось скопировать. Скопируйте вручную:\n\n' + text);
        }
        document.body.removeChild(textArea);
    }
};