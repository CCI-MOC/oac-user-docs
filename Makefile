MDDOCS = $(wildcard *.md)
HTMLDOCS = $(MDDOCS:.md=.html)
TXTDOCS = $(MDDOCS:.md=.txt)
PDFDOCS = $(MDDOCS:.md=.pdf)
STYLE = --css style.css

CHROME = google-chrome

%.html: %.md
	pandoc --standalone $(STYLE) -o $@ -fmarkdown-implicit_figures $<

%.txt: %.md
	pandoc -f markdown -t plain --wrap=auto -o $@ $<

%.pdf: %.html
	$(CHROME) --headless --print-to-pdf=$@ --no-pdf-header-footer $<

all: $(HTMLDOCS) $(TXTDOCS) $(PDFDOCS)

clean:
	rm -f $(HTMLDOCS) $(TXTDOCS) $(PDFDOCS)
