qrCodeApp = angular.module("qrCodeApp", ['ngRoute'])

//----------------------------------//
//  service to get http requests    //
//----------------------------------//
.service('getRequest', ['$http', function($http) {
	var getData = function(request, parms={}) {
		return $http.get(request, {params: parms, cache: 'true' }).then(function(response) {
			return response.data;
		});
	};
	return {
		getData: getData
	};
}])
//----------------------------------//

.controller("contactController", ['$scope', '$compile', 'getRequest', function contactController($scope, $compile, getRequest) {
    var vm = this;
    vm.headings = [];
    vm.title = "VCard-QRCode";
    vm.loaded = false;
    vm.download = false;
    vm.updateTable = function(csv) {
        vm.contacts = [];
        vm.download = true;
        localStorage.setItem("contacts", csv);
        var rows = csv.split("\n");
        vm.headings = rows[0].replace(", "," - ").replace(/["]/g,"").split(",");
        for (var i = 1; i < rows.length-1; i++) {
            //split by separator (,) and get the columns
            data = rows[i].replace(", "," - ").replace(", "," - ").replace(/["]/g,"").split(",");
            let last = data[0].split(" - ")[0];
            let first = data[0].split(" - ")[1];
            let name = first + " " + last;
            let title = data[1];
            let phone = data[2];
            let cell = data[3];
            let email = data[4];
            let business = data[5];
            let bcity = data[6];
            let bstate = data[7];
            let bzip = data[8];
            let home = data[9];
            let hcity = data[10];
            let hstate = data[11];
            let hzip = data[12];
            let other = data[13];
            let ocity = data[14];
            let ostate = data[15];
            let ozip = data[16];
            let text = `BEGIN:VCARD
VERSION:3.0
N:${last};${first}
FN:${name}
ORG:ANDMORE
TITLE:${title}
TEL;VOICE:${phone}
TEL;CELL:${cell}
EMAIL;INTERNET:${email}
URL:https://andmore.com`;
            if (business != undefined && business != "") {
                text += `
ADR;WORK;PREF:;;${business};${bcity};${bstate};${bzip}`;
                if (home != undefined && home != "") {
                    text += `
ADR;HOME:;;${home};${hcity};${hstate};${hzip}`;
                }
                if (other != undefined && other != "") {
                    text += `
ADR;POSTAL:;;${other};${ocity};${ostate};${ozip}`;
                }
            } else if (home != undefined && home != "") {
                text += `
ADR;HOME;PREF:;;${home};${hcity};${hstate};${hzip}`;
                if (other != undefined && other != "") {
                    text += `
ADR;POSTAL:;;${other};${ocity};${ostate};${ozip}`;
                }
            } else if (other != undefined && other != "") {
                text += `
ADR;POSTAL;PREF:;;${other};${ocity};${ostate};${ozip}`;
            }
            text += `
END:VCARD`;
            url = `https://chart.googleapis.com/chart?cht=qr&chs=240x240&chl=${encodeURIComponent(text)}`;
            vm.contacts.push({
                last: last,
                first: first,
                name: name,
                title: title,
                phone: phone,
                cell: cell,
                email: email,
                text: text,
                url: url,
                business: business,
                bcity: bcity,
                bstate: bstate,
                bzip: bzip,
                home: home,
                hcity: hcity,
                hstate: hstate,
                hzip: hzip,
                other: other,
                ocity: ocity,
                ostate: ostate,
                ozip: ozip,
            });
        }
    }

    $scope.getCodes = function() {
        vm.wait = true;
        let contacts = [];
        console.log("GETTING CONTACTS");
        var file = document.querySelector("#file").files[0];
        var reader = new FileReader();
        reader.readAsText(file);

        //if you need to read a csv file with a 'ISO-8859-1' encoding
        /*reader.readAsText(file,'ISO-8859-1');*/

        //When the file finish load
        reader.onload = function (event) {
            var csv = event.target.result;
            vm.updateTable(csv);
            $scope.$digest();
        };
    }
    let storage = localStorage.getItem("contacts")
    if (storage != null) {vm.updateTable(storage);}

    $scope.downloadCodes = function() {

        function urlToPromise(url) {
            return new Promise(function(resolve, reject) {
                JSZipUtils.getBinaryContent(url, function (err, data) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        }

        function downloadZip(z) {
            z.generateAsync({type:"base64"}).then(function (base64) {
                window.location = "data:application/zip;base64," + base64;
            });
        }

        console.log("downloading");
        let zip = new JSZip();
        vm.contacts.forEach((contact) => {
            zip.file(`${contact.first.split(" ")[0]}-${contact.last}.png`, urlToPromise(contact.url), {binary:true});
        });
        setTimeout(downloadZip(zip), 1000);
    }


}]);