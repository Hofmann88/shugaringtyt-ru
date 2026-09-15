/**
 * Принимает заявки с сайта shugaringtyt.ru и добавляет их строкой
 * в лист "Заявки" привязанной Google Таблицы.
 *
 * Установка: см. new/apps-script/README.md
 */

var SHEET_NAME = "Заявки";
var HEADERS = ["Дата заявки", "Имя", "Телефон", "Услуга", "Желаемая дата", "Комментарий", "Страница"];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet_();

    sheet.appendRow([
      new Date(),
      data.name || "",
      data.phone || "",
      data.service || "",
      data.date || "",
      data.comment || "",
      data.page || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}
