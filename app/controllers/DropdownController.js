angular.module('app').controller('DropdownController', ['$scope', '$timeout', function($scope, $timeout) {
    const vm = this;

    // Initialize dropdown state
    vm.isOpen = false;

    // Toggle dropdown
    vm.toggle = function(event) {
        if (event) {
            event.stopPropagation();
        }
        vm.isOpen = !vm.isOpen;
    };

    // Close dropdown
    vm.close = function() {
        vm.isOpen = false;
    };

    // Handle click outside to close dropdown
    const handleOutsideClick = function(event) {
        $timeout(function() {
            const dropdownElement = event.target.closest('.relative');
            if (!dropdownElement || !dropdownElement.contains(event.target)) {
                vm.isOpen = false;
            }
        });
    };

    // Bind outside click handler
    document.addEventListener('click', handleOutsideClick);

    // Cleanup on destroy
    $scope.$on('$destroy', function() {
        document.removeEventListener('click', handleOutsideClick);
    });
}]);
