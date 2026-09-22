import { Clock } from 'lucide-react'
import React from 'react'

const ProcessingBanner = () => {

    return (

        <div className="mx-4 sm:mx-6 mt-3 flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2 text-xs font-medium text-warning shrink-0">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            Your document is still being processed — chat unlocks automatically once it's ready.
        </div>

    )

}

export default ProcessingBanner 