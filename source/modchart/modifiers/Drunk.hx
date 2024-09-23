package modchart.modifiers;

import modchart.core.util.Constants.RenderParams;
import modchart.core.util.Constants.NoteData;
import openfl.geom.Vector3D;

class Drunk extends Modifier
{
    override public function render(curPos:Vector3D, params:RenderParams)
    {
		var speed = getSubmod('drunkSpeed');
		var period = getSubmod('drunkPeriod');
		var offset = getSubmod('drunkOffset');
        var angle = params.sPos * 0.001 * (1 + speed) + params.receptor * ((offset * 0.2) + 0.2) + params.hDiff * ((period * 10) + 10) / HEIGHT;
        var drunk = (cos(angle) * ARROW_SIZE * 0.5);

        curPos.x += drunk * (percent * getSubmod('drunkX', 1));
        curPos.y += drunk * getSubmod('drunkY');
        curPos.z += drunk * getSubmod('drunkZ');

        return curPos;
    }
	override public function getAliases():Array<String>
		return ['drunkX', 'drunkY', 'drunkZ'];
}