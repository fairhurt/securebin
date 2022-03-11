import { getItemAsync } from "./storage";
import { Storage } from "../../constants";

export async function postPastebin(encryptQuery: string) {
    const apiKey = "klVQoqGaWEZGAuv9qALhwCN94jyuBQ7w";
    const apiKey2 = "bYYcefkxnd18LJMggTKIH2Vg8m8QP-N0";
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append(
        "Cookie",
        "_csrf-frontend=329554c223d6a49136d2267538fc128591f3ec2150a223caa1d6db2d96f0265aa%3A2%3A%7Bi%3A0%3Bs%3A14%3A%22_csrf-frontend%22%3Bi%3A1%3Bs%3A32%3A%22rO1MDUiUJzJoMpRxGyEtQ9KVFoodbesw%22%3B%7D; pastebin_posted=99663e9444444257d4931e06307949fe5a481efea6e1d02e1d14d0dd216f60dca%3A2%3A%7Bi%3A0%3Bs%3A15%3A%22pastebin_posted%22%3Bi%3A1%3Bs%3A8%3A%22JC4FD0vP%22%3B%7D"
    );

    const apiKey3 = await getItemAsync(Storage.API_KEY);
    console.log("API ", apiKey3);
    var content = new URLSearchParams();
    content.append("api_dev_key", apiKey2);
    content.append("api_paste_code", encryptQuery);
    content.append("api_option", "paste");
    console.log("encryptQuery ", encryptQuery);
    console.log("Content ", content);

    const response = await fetch(`https://pastebin.com/api/api_post.php`, {
        method: "POST",
        headers: myHeaders,
        body: content,
        redirect: "follow",
    });

    if (!response.ok) {
        console.log(Error(response.statusText));
        console.log(response);
        return "";
    }

    const link = await response.text();
    console.log(link);
    return link;
}

export async function getPastebin(link: string) {
    //Gets webpage from url
    const array = link.split("/");
    if (array[3]) {
        link = array[3];
    } else {
        link = array[0];
    }

    const response = await fetch(`https://pastebin.com/raw/` + link);

    if (!response.ok) {
        console.log(Error(response.statusText));
        console.log(response);
        return "";
    }

    const text = await response.text();
    console.log(text);
    return text;
}