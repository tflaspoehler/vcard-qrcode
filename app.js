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
        vm.loaded = true;
        localStorage.setItem("contacts", csv);
        var rows = csv.split("\n");
        vm.headings = rows[0].replace(", "," - ").replace(/["]/g,"").split(",");
        for (var i = 2; i < rows.length-1; i++) {
            //split by separator (,) and get the columns
            data = rows[i].replace(", "," - ").replace(", "," - ").replace(/["]/g,"").split(",");
            let last = data[0].split(" - ")[0];
            let first = data[0].split(" - ")[1];
            let name = first + " " + last;
            let title = data[1];
            let phone = data[2];
            let cell = data[3];
            let email = data[4]
            let text = `BEGIN:VCARD
VERSION:3.0
N:${last};${first}
FN:${name}
ORG:ANDMORE
TITLE:${title}
TEL;VOICE:${phone}
TEL;CELL:${cell}
EMAIL;INTERNET:${email}
URL:https://andmore.com
END:VCARD`;
            url = `http://chart.googleapis.com/chart?cht=qr&chs=240x240&chl=${encodeURIComponent(text)}`;
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
            });
            console.log(vm.contacts[vm.contacts.length-1])
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
        // setTimeout(() => {vm.contacts = contacts;}, 1000);
        console.log(vm.contacts);
        // $compile(document.querySelector("#table").contents())($scope);
    }
    let storage = localStorage.getItem("contacts")
    console.log(storage);
    if (storage != null) {vm.updateTable(storage);}

    vm.downloadCodes = function() {
        console.log("downloading");
    }


}]);