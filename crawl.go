package main

import (
	"fmt"
	"time"
	"net/http" //to retrieve page
	"flag"
	"os"
	"golang.org/x/net/html"
	"strings"
)

func main() {
	flag.Parse()
	args := flag.Args()

	if len(args) < 1 {
		fmt.Println("Please specify start page")
		os.Exit(1)
	}

	BASE_URL := args[0]

	process := make(chan string)
	complete := make(chan bool)

	go crawlURL(BASE_URL, process, complete)
	process <- args[0]
	<-complete
	fmt.Println("Done")

}

func crawlURL(base string, process chan string, complete chan bool){
	visited:= make(map[string]bool)
	for {
		select {
		case url := <- process:
			if _,ok := visited[url]; ok { //skip url if already visited
				continue
			} else {
					visited[url] = true
					go navigate(base, url, process)
			}
		case <- time.After(1000 * time.Millisecond):
			fmt.Printf("Crawled through %d pages \n", len(visited))
			complete <- true

		}
	}
}

func navigate(base string, url string, process chan string){
	fmt.Println(url)

	resp, err := http.Get(url)

	if err != nil{
		fmt.Println(err)
		return
	}

	defer resp.Body.Close() // need to close resource we opened on Get(), closing tcp connection to server
	z := html.NewTokenizer(resp.Body)
	for {
		tt := z.Next()
		if tt == html.ErrorToken {
			return
		}

		if tt == html.StartTagToken {
			t := z.Token()

			if t.Data == "a" {
				for _, a := range t.Attr {
					if a.Key == "href" {

						// check if link is within base url
						if strings.HasPrefix(a.Val, base) {
							process <- a.Val
						}
					}
				}
			}
		}
	}
	}


