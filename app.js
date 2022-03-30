import * as d3 from 'https://unpkg.com/d3?module'

const form = document.querySelector('.form')
let valuesArray = []
let valuesArrayObj = []
form.addEventListener('submit', (e)=>{
    e.preventDefault()
    const input = document.querySelector('.input')
    const values = input.value
    let temp = ''
    for(let i=0; i<values.length; i++){
        if(values[i] !== ' ') temp += values[i]
        else{
            if(temp !== NaN){
                valuesArray.push(parseInt(temp))
                valuesArrayObj.push({'number': parseInt(temp)})
            }
            temp = ''
        }
    }
    if(temp !== '' && temp !== NaN){
        valuesArray.push(parseInt(temp))
        valuesArrayObj.push({'number': parseInt(temp)})
        temp = ''
    }
    draw()
})

async function draw()
{
    let seenIndices = []
    let lastIndex = 0
    let data = valuesArrayObj
    // let data = valuesArray
    // const yAccess = d => d
    const yAccess = d => d['number']
    console.log(yAccess(data[0]))
    const xAccess = d => data.indexOf(d, lastIndex++)
    // console.log(xAccess(data[2]))
    console.log(typeof(yAccess(data[0])))
    const dims = {
        width: 0.8 * window.innerWidth,
        height: 30 * parseFloat(window.getComputedStyle(document.body,null).getPropertyValue("font-size")),
        margins: {
            top: 30,
            right: 10,
            bottom: 30,
            left: 30
        },
        boundedWidth: null,
        boundedHeight: null
    }

    dims.boundedWidth = dims.width - dims.margins.right - dims.margins.left
    dims.boundedHeight = dims.height - dims.margins.top - dims.margins.bottom

    const wrapper = d3.select('#wrapper')
    .append('svg')
    .attr('width', dims.width)
    .attr('height', dims.height)

    /**
     * utils
     */
        let copyValuesArray = valuesArray
        copyValuesArray.sort((a, b) =>  b - a)
        let minDiff = Number.MAX_SAFE_INTEGER
        for(let i=0; i<copyValuesArray.length-1; i++){
            minDiff = Math.min(minDiff, copyValuesArray[i+1]-copyValuesArray[i])
        }
    /**
     * end utils
    */

    const max_value = copyValuesArray[0]+1

  //scales
    const yScale = d3.scaleLinear()
    // .domain([0, max_value])
    .domain(d3.extent(data, yAccess))
    .range([dims.boundedHeight, 0])

    const xScale = d3.scaleLinear()
    .domain([0, data.length])
    .range([0, dims.boundedWidth])
  //end scales
  console.log(data)


    const bounds = wrapper.append('g')
    .style('transform', `translate(${dims.margins.left}px, ${dims.margins.top}px)`)
    

  //axes generators
    const yAxisGenerator = d3.axisLeft()
    .scale(yScale)
    .tickValues(d3.range(0, max_value, 1)) //TODO: replace 1 with minDiff
    const yAxis = bounds.append('g')
    .call(yAxisGenerator)

    const xAxisGenerator = d3.axisBottom()
    .scale(xScale)
    .tickValues(d3.range(0, data.length+1, 1))
    const xAxis = bounds.append('g')
    .style('transform', `translateY(${dims.boundedHeight}px)`)
    .call(xAxisGenerator)
  //end axes generators
  


    //plotting data
    const bins = valuesArrayObj
    const binsGroup = bounds.append('g')
    
    const binGroups = binsGroup.selectAll('g')
    .data(bins)
    .join('g')

    const chartWidth = xScale(xAccess(data[2])) - xScale(xAccess(data[1]))

    lastIndex = 0
    
    const barRects = binGroups.append('rect')
    .attr('x', d => xScale(xAccess(d)) + 1)
    .attr('y', d => yScale(yAccess(d)))
    .attr('width', chartWidth )
    .attr('height', d => dims.boundedHeight - yScale(yAccess(d)))
    
    lastIndex = 0
    
    let groups = []
    // let localmaxL = Number.MIN_SAFE_INTEGER
    // let breakpoint = -1
    // let nextLeft = -1
    // for(let i=0; i<data.length; i++){
    //     if(i >= breakpoint){
    //         let rightL = nextBig(data, data[i]['number'], i)
    //         // console.log('rightL', rightL)
    //         groups.push({
    //             left: nextLeft === -1?data[i]['number']:nextLeft,
    //             right: rightL.number,
    //             left_index: nextLeft === -1?i:breakpoint,
    //             right_index: rightL.index
    //         })
    //         nextLeft = rightL.number
    //         breakpoint = rightL.index
    //     }
    // }
    // groups = groups.filter(g=>g.right!==null && g.left !== null)
    // console.log(groups)
    let localmaxR = Number.MIN_SAFE_INTEGER
    let breakpoint = -1
    let initial_big=null, initial_big_index =null
    let lastBig = Number.MIN_SAFE_INTEGER
    for(let i=0; i<data.length; i++){
        //find first larger than the current
        let current_data_point = data[i]['number']
        for(let j=i+1; j<data.length; j++){
            if( (breakpoint<0 && data[j]['number'] > current_data_point) || (breakpoint>=0 && data[j]['number'] > lastBig && data[j]['number']!==0)){
                //make a group and add
                let tempL = breakpoint<0? current_data_point: Math.max(data[breakpoint]['number'], current_data_point)
                tempL = initial_big === null? tempL : Math.max(tempL, initial_big)
                let tempLi = breakpoint<0? i: data.findIndex((da, breakpoint=breakpoint)=>{return da['number'] === Math.max(data[breakpoint]['number'], current_data_point)})
                tempLi = initial_big === null? tempLi : data.findIndex((da, breakpoint=initial_big_index)=>{return da['number'] === Math.max(data[breakpoint]['number'], initial_big)})
                    console.log('pushed from here ', tempL, data[j]['number'], j)
                    console.log('current_data_point', current_data_point, data[j]['number'], ' data[j')
                groups.push({
                    left: tempL,
                    left_index: tempLi,
                    right: data[j]['number'],
                    right_index: j
                })
                if(breakpoint < 0) lastBig = Math.max(current_data_point, data[j]['number'])
                else lastBig = Math.max(Math.max(data[breakpoint]['number'], current_data_point), data[j]['number'])
                i = j
                breakpoint = i
                break;
            }//ADDED:
            else if(breakpoint < 0 && data[j]['number']<=current_data_point){
                initial_big = current_data_point
                initial_big_index = i
                console.log('here to check befor breakpoint: ', breakpoint)
                breakpoint = i
                console.log('here to check ', breakpoint, ' data[j: ', data[j]['number'], ' current data point: ', current_data_point, ' initial_big:', initial_big)
                // groups.push({
                //     left: i,
                //     left_index: ,
                //     right: ,
                //     right_index: 
                // })
            }
            else if(breakpoint >= 0 && data[j]['number'] <= lastBig){
                localmaxR = Math.max(data[j]['number'], localmaxR)
                //count >1 of lastBig
            }
        }
    }
    if(localmaxR !== Number.MIN_SAFE_INTEGER){
        let lb_index = data.findIndex((da)=>{ return da['number'] === lastBig})
        let lm_index = data.findIndex((da, breakpoint = breakpoint)=>{ return da['number'] === localmaxR})
        console.log(lastBig, localmaxR, lb_index, lm_index)
        // console.log('pushed from here', localmaxR, lastBig)
        groups.push({
            left_index: Math.min(lm_index, lb_index),
            left: data[Math.min(lm_index, lb_index)]['number'],
            right_index: Math.max(lb_index, lm_index),
            right: data[Math.max(lm_index, lb_index)]['number']
        })
    }
    console.log('groups', groups)
    //end utils
    

    const waterRects = binGroups.append('rect')
    .style('opacity', 0.7)
    .style('fill', `rgb(${lastIndex * 20}, 0, 0`)
    .attr('x', d =>xScale(xAccess(d))) //removed + chartWidth
    .attr('y', d =>{
        const _index = data.indexOf(d)
        let ansR = findFirst(data, d, _index)
        let ansL = findFirstLeft(data, d, _index)
        let groupno = -1
        for(let i=0; i<groups.length; i++){
            if(_index >= groups[i].left_index && _index <= groups[i].right_index){
                groupno = i
                break;
            }
        }
        console.log("GROUPNO: ", groupno)
        if(groupno < 0){
            let _dist = Math.max((data.length-1) - groups[groups.length-1].left_index, (data.length-1) - groups[groups.length-1].right)
            switch (_dist) {
                case data.length-1 - groups[groups.length-1].left_index:
                    return yScale(Math.min(groups[groups.length-1].left, data[data.length-1]['number']))
                    break
                case data.length-1 - groups[groups.length-1].right_index:
                    return yScale(Math.min(groups[groups.length-1].right, data[data.length-1]['number']))
                    break
                default:
                    return 0
                    break
            }
        }
        
        const res = yScale( Math.min(groups[groupno].left, groups[groupno].right))
        if(groupno >=0) console.log(yAccess(d), ' in groupno: ', groupno, ' with left,right: ', groups[groupno].left, ' and ', groups[groupno].right, ' with,', res )
        if(groupno === -1) console.warn("NO GROUP FOUND")
        else return res
    })
    .attr('width', d => chartWidth)
    .attr('height', d =>{
        const _index = data.indexOf(d)
        let ansR = findFirst(data, d, _index)
        let ansL = findFirstLeft(data, d, _index)
        let groupno = -1
        for(let i=0; i<groups.length; i++){
            if(_index >= groups[i].left_index && _index <= groups[i].right_index){
                groupno = i
                break;
            }
        }
        if(groupno < 0){
            let _dist = Math.max((data.length-1) - groups[groups.length-1].left_index, (data.length-1) - groups[groups.length-1].right)
            switch (_dist) {
                case data.length-1 - groups[groups.length-1].left_index:
                    return dims.boundedHeight - yScale(Math.min(groups[groups.length-1].left, data[data.length-1]['number']))
                    break
                case data.length-1 - groups[groups.length-1].right_index:
                    return dims.boundedHeight - yScale(Math.min(groups[groups.length-1].right, data[data.length-1]['number']))
                    break
                default:
                    return 0
                    break
            }
        }
        
        if(groupno >=0) console.log(yAccess(d), ' in groupno', groupno, ' with ', groups[groupno])
        const res = yScale( Math.min(groups[groupno].left, groups[groupno].right))
        if(groupno === -1) console.warn("NO GROUP FOUND")
        else return dims.boundedHeight - res

    })
    
    
    lastIndex = 0
    const texts = binGroups.append('text')
    .style('fill','#22ff00')
    .style('font-weight', '700')
    .attr('width', '20px')
    .attr('height', '20px')
    .attr('x', d =>{
        lastIndex++
        return lastIndex * 1 *chartWidth
    })
    .attr('y', d => yScale(yAccess(d)))
    .text(d => (yAccess(d)).toString())


}

function nextBig(data, d, current_index){
    let ans = {
        number: null,
        index: null
    }
    let _max = Number.MIN_SAFE_INTEGER
    for(let i=current_index+1; i<data.length; i++){
        let temp = _max
        _max = Math.max(data[i]['number'], _max)
        if(temp !== _max){
            ans.number = _max
            ans.index = i
        }
    }
    return ans
}

function findFirst(data, d, current_index){
    let ans = {
        number: null,
        index: null
    }
    let _max = Number.MIN_SAFE_INTEGER
    let found = false
    for(let i=current_index+1; i<data.length; i++){
        // console.log(data[i]['number'], d['number'])
        if(data[i]['number'] > d['number'] && i > current_index && !found){
            found = true
            ans.number = data[i]['number']
            ans.index = i
        }
        else if(data[i]['number'] < d['number'] && i > current_index){
            let temp = _max
            _max = Math.max(data[i]['number'], _max)
            // if(data[i]['number'] == 4) console.log(_max, temp)
            if(temp !== _max) ans.index = i
        }
    }
    
    if(ans.number === null){
        ans.number = _max === Number.MIN_SAFE_INTEGER? d['number']:_max
        // console.log('here for: ', d['number'], _max)
    }
    return ans
}

function findFirstLeft(data, d, current_index){
    let ans = {
        number: null,
        index: null
    }
    let _max = Number.MIN_SAFE_INTEGER
    let found = false
    for(let i=current_index-1; i>=0; i--){
        if(data[i]['number'] > d['number'] && i < current_index && !found){
            found = true
            ans.number = data[i]['number']
            ans.index = i
        }
        else if(data[i]['number'] < d['number'] && i < current_index){
            let temp = _max
            _max = Math.max(data[i]['number'], _max)
            if(temp !== _max) ans.index = i
        }
    }
    if(ans.number === null){
        ans.number = _max === Number.MIN_SAFE_INTEGER? d['number']:_max
    }
    return ans
}



// let prevHeight = 0
    // const waterRects = binGroups.append('rect')
    // .style('opacity', 0.7)
    // .style('fill', `rgb(${lastIndex * 20}, 0, 0`)
    // .attr('x', d => xScale(xAccess(d)) + chartWidth)
    // // .attr('y', d=>200)
    // .attr('y', d =>{
    //     const _index = data.indexOf(d)
    //     let ansR = findFirst(data, d, _index)
    //     let ansL = findFirstLeft(data, d, _index)
    //     let leftBound = Math.max(ansL.number, yAccess(d))
    //     let rightBound = ansR.number
    //     console.log(`y: for ${yAccess(d)}, left: ${leftBound} and right: ${rightBound}`)
    //     const res = Math.max(yScale(leftBound), yScale(rightBound))
    //     prevHeight = Math.max(res, prevHeight)
    //     // return prevHeight >= res? prevHeight: res
    //     return res
    // })
    // .attr('width', d => chartWidth)
    // // .attr('height', d => dims.boundedHeight - 200)
    // .attr('height', d =>{
    //     const _index = data.indexOf(d)
    //     let ansR = findFirst(data, d, _index)
    //     let ansL = findFirstLeft(data, d, _index)
    //     let leftBound = Math.max(ansL.number, yAccess(d))
    //     let rightBound = ansR.number
    //     console.log(`height: for ${yAccess(d)}, ${dims.boundedHeight - Math.max(yScale(leftBound), yScale(rightBound))}`)
    //     const res = dims.boundedHeight - Math.max(yScale(leftBound), yScale(rightBound))
    //     prevHeight = Math.max(res, prevHeight)
    //     return res
    // })
// function findFirst2(data, d, current_index){
//     let ans = {}
//     let found = false
//     let _max = Number.MIN_SAFE_INTEGER
//     data.forEach((da, _in)=>{
//         if(d['number'] < da['number'] && !found && _in > current_index){
//             ans.number = da['number']
//             ans.index = _in
//             found = true
//         }
//         else if(d['number'] >= da['number'] && _in >= current_index){
//             let temp = _max
//             _max = Math.max(da['number'], _max)
//             if(_max !== temp && !found){
//                 ans.index = _in
//                 ans.number = da['number']
//             }
//         }
//     })
//     if(!found) ans.number = _max
//     return ans
// }

// function findFirstLeft2(data, d, current_index){
//     let ans = {}
//     let found = false
//     let _max = Number.MIN_SAFE_INTEGER
//     data.forEach((da, _in)=>{
//         if(d['number'] < da['number'] && !found && _in < current_index){
//             ans.number = da['number']
//             ans.index = _in
//             found = true
//         }
//         else if(d['number'] >= da['number'] && _in <= current_index){
//             let temp = _max
//             _max = Math.max(da['number'], _max)
//             if(_max !== temp && !found){
//                 ans.index = _in
//                 ans.number = da['number']
//             }
//         }
//     })
//     if(!found) ans.number = _max
//     return ans
// }


// const waterRects = binGroups.append('rect')
    // .style('opacity', 0.7)
    // .style('fill', `rgb(0, 0, ${lastIndex * 20}`)
    // .attr('x', d => xScale(xAccess(d)) + chartWidth)
    // .attr('y', d =>{
    //     const _index = data.indexOf(d)
    //     lastIndex++
    //     // console.log(_index)
    //     if(_index-1 >= 0 && _index !== data.length-1){
    //         max_left = Math.max(yAccess(d), max_left)
    //         let ansR = findFirst2(data, d, _index)
    //         if(_index === 4){
    //             console.log('ansR', ansR)
    //         }
    //         let ansL = findFirstLeft2(data, d, _index)
    //         const res = Math.min(yScale(yAccess(d)), yScale(ansL.number), yScale(ansR.number))
    //         console.log(res)
    //         return res
    //         // nextWidth = ans.index - _index
    //         // nextWidth = nextWidth === NaN? chartWidth: nextWidth
    //         // console.log('width', nextWidth)
    //         // return Math.min(yScale(max_left), yScale(ans.number))
    //     }
    //     else if(_index === 0){
    //         max_left = yAccess(d)
    //         let ansR = findFirst2(data, d, _index)
    //         return ansR.number > yAccess(d)? yScale(yAccess(d)): yScale(ansR.number)
    //     }
    //     else if(_index === data.length - 1){
    //         let temp = max_left
    //         max_left = Math.max(yAccess(d), max_left)
    //         return temp === max_left?yScale(yAccess(d)) : yScale(temp)

    //     }
    // })
    // .attr('width', d => chartWidth)
    // // .attr('height', 200)
    // .attr('height', d =>{
    //     const _index = data.indexOf(d)
    //     if(_index-1 >= 0 && _index !== data.length-1){
    //         max_left = Math.max(yAccess(d), max_left)
    //         let ansR = findFirst2(data, d, _index)
    //         if(_index === 4){
    //             console.log(max_left)
    //             console.log(ansR)
    //         }
    //         let ansL = findFirstLeft2(data, d, _index)
    //         return dims.boundedHeight - Math.min(yScale(yAccess(d)), yScale(ansL.number), yScale(ansR.number))
    //         // return dims.boundedHeight - Math.min(yScale(max_left), yScale(ans.number))
    //         // return Math.abs(dims.boundedHeight -  yScale(Math.min(max_left, ans.number)))
    //     }
    //     else if(_index === 0){
    //         max_left = yAccess(d)
    //         let ansR = findFirst2(data, d, _index)
    //         return ansR.number > yAccess(d)? dims.boundedHeight - yScale(yAccess(d)): dims.boundedHeight - yScale(ansR.number)
    //     }
    //     else if(_index === data.length - 1){
    //         let temp = max_left
    //         max_left = Math.max(yAccess(d), max_left)
    //         return temp === max_left?yScale(yAccess(d)) : yScale(temp)

    //     }
    // })
// let nextWidth = 0
    // let max_left = Number.MIN_SAFE_INTEGER
    // let max_right = Number.MIN_SAFE_INTEGER