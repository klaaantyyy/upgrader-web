
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent.parent
HTML_FILE = ROOT / "index.html"


class ResourceChecker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.resources = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)

        for attribute in ("src", "href", "poster"):
            value = attrs.get(attribute)

            if value:
                self.resources.append(value)


def check_site():
    if not HTML_FILE.is_file():
        raise FileNotFoundError("Файл index.html не найден")

    parser = ResourceChecker()
    parser.feed(HTML_FILE.read_text(encoding="utf-8"))

    errors = []

    for resource in parser.resources:
        parsed = urlsplit(resource)

        if parsed.scheme or parsed.netloc or not parsed.path:
            continue

        relative_path = unquote(parsed.path).lstrip("/")

        if not relative_path:
            relative_path = "index.html"

        target = (ROOT / relative_path).resolve()

        if not target.is_relative_to(ROOT.resolve()):
            errors.append(f"Недопустимый путь: {resource}")
            continue

        if target.is_dir():
            target = target / "index.html"

        if not target.is_file():
            errors.append(f"Файл не найден: {resource}")

    if errors:
        print("Проверка сайта завершилась с ошибками:")
        for error in errors:
            print(f" - {error}")
        raise SystemExit(1)

    print("Проверка пройдена: локальные ресурсы найдены.")


if __name__ == "__main__":
    check_site()
