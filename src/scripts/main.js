import gsap from "gsap";
function main() {
    // gsap.fromTo(".right .card", { x: '100%' }, { x: 0, stagger: .2, delay: .4 })
}
main();
const setup = () => {
    document.addEventListener('swup:page:view', () => {
        main();
    })
}
if (window.swup) {
    setup()
} else {
    document.addEventListener('swup:enable', setup)
}